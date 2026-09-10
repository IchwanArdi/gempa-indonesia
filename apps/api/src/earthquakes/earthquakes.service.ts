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

    this.logger.log(`Ingest selesai: ${processed} data diproses`);

    return {
      fetched: earthquakes.length,
      processed,
    };
  }

  // the findNearby method retrieves earthquake records from the database that are within a specified radius (in kilometers) of a given latitude and longitude. It uses raw SQL queries to perform spatial calculations using PostGIS functions.
  async findNearby(lat: number, lng: number, radiusKm: number) {
    const radiusMeters = radiusKm * 1000;

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
