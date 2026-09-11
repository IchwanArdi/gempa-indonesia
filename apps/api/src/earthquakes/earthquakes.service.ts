import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { EarthquakesResponse } from '@trackly/types';
import { PrismaService } from '../prisma/prisma.service.js';
import { BmkgService } from './bmkg.service.js';

@Injectable()
export class EarthquakesService {
  // this logger is used to log messages related to the EarthquakesService
  private readonly logger = new Logger(EarthquakesService.name);

  // the constructor injects the PrismaService and BmkgService into the EarthquakesService
  constructor(
    private readonly prisma: PrismaService,
    private readonly bmkgService: BmkgService,
  ) {}

  // the findAll method retrieves the latest 50 earthquake records from the database and returns them along with the total count of records
  async findAll(): Promise<EarthquakesResponse> {
    const [data, total] = await Promise.all([
      this.prisma.earthquake.findMany({
        orderBy: { occurredAt: 'desc' },
        take: 50,
      }),
      this.prisma.earthquake.count(),
    ]);

    return { data, meta: { total } };
  }

  // The handleScheduledIngest method is a cron job that runs every 5 minutes to ingest earthquake data from the BMKG API
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleScheduledIngest() {
    this.logger.log('Scheduled ingest from BMKG started');
    const result = await this.ingestFromBmkg();
    this.logger.log(
      `Scheduled ingest from BMKG completed: ${result.fetched} records fetched`,
    );
  }

  // The ingestFromBmkg method fetches earthquake data from the BMKG API and ingests it into the database
  async ingestFromBmkg() {
    const earthquakes = await this.bmkgService.fetchDirasakan();
    if (!earthquakes.length) {
      return { fetched: 0, processed: 0 };
    }

    let processed = 0;
    for (const eq of earthquakes) {
      await this.prisma.earthquake.upsert({
        where: {
          source_externalId: {
            source: eq.source,
            externalId: eq.externalId,
          },
        },
        update: {
          magnitude: eq.magnitude,
          depthKm: eq.depthKm,
          latitude: eq.latitude,
          longitude: eq.longitude,
          region: eq.region,
          felt: eq.felt,
          occurredAt: eq.occurredAt,
        },
        create: {
          externalId: eq.externalId,
          source: eq.source,
          magnitude: eq.magnitude,
          depthKm: eq.depthKm,
          latitude: eq.latitude,
          longitude: eq.longitude,
          region: eq.region,
          felt: eq.felt,
          occurredAt: eq.occurredAt,
        },
      });
      processed++;
    }

    // Single batch update to populate spatial geometry for all records with missing geom
    await this.prisma.$executeRaw`
      UPDATE "Earthquake"
      SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
      WHERE geom IS NULL;
    `;

    // Single batch update to detect and mark aftershocks based on spatial and temporal proximity to mainshocks
    const updatedAftershocks = await this.prisma.$executeRaw`
      UPDATE "Earthquake" AS target
      SET
        "isAftershock" = true,
        "mainshockId" = candidate."mainId"
      FROM (
        SELECT DISTINCT ON (e.id)
          e.id AS "eqId",
          main.id AS "mainId"
        FROM "Earthquake" e
        JOIN "Earthquake" main ON
          main.id != e.id
          AND main.magnitude > e.magnitude
          AND main."occurredAt" BETWEEN (e."occurredAt" - INTERVAL '72 hours') AND e."occurredAt"
          AND ST_DWithin(e.geom, main.geom, 50000)  -- 50km dalam meter
        WHERE e."isAftershock" = false
          AND e."mainshockId" IS NULL
          AND e.geom IS NOT NULL
          AND main.geom IS NOT NULL
        ORDER BY e.id, main.magnitude DESC  -- pilih mainshock terbesar
      ) candidate
      WHERE target.id = candidate."eqId";
    `;

    // Log the number of aftershocks detected and updated
    if (updatedAftershocks > 0) {
      this.logger.log(
        `Berhasil mendeteksi & memperbarui ${updatedAftershocks} gempa susulan sebagai aftershock`,
      );
    }

    // Log the number of records processed after ingesting from BMKG
    this.logger.log(`Ingest selesai: ${processed} data diproses`);

    // Return the number of records fetched and processed after ingesting from BMKG
    return {
      fetched: earthquakes.length,
      processed,
    };
  }

  // the findNearby method retrieves earthquake records from the database that are within a specified radius (in kilometers) of a given latitude and longitude. It uses raw SQL queries to perform spatial calculations using PostGIS functions.
  async findNearby(lat: number, lng: number, radiusKm: number) {
    const radiusMeters = radiusKm * 1000;

    // Use raw SQL query to find earthquakes within the specified radius using PostGIS functions
    const data = await this.prisma.$queryRaw<
      Array<{
        id: string;
        externalId: string;
        source: string;
        magnitude: number;
        depthKm: number;
        latitude: number;
        longitude: number;
        occurredAt: Date;
        region: string;
        felt: string;
        isAftershock: boolean;
        mainshockId: string | null;
        distanceKm: number;
      }>
    >`
      SELECT
        id,
        "externalId",
        source,
        magnitude,
        "depthKm",
        latitude,
        longitude,
        "occurredAt",
        region,
        felt,
        "isAftershock",
        "mainshockId",
        ST_Distance(
          geom,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) / 1000 AS "distanceKm"
      FROM "Earthquake"
      WHERE ST_DWithin(
        geom,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radiusMeters}
      )
      ORDER BY "distanceKm" ASC
    `;

    return {
      data,
      meta: {
        total: data.length,
        center: { lat, lng },
        radiusKm,
      },
    };
  }
}
