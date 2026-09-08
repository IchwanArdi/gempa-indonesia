import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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
  async findAll() {
    const [data, total] = await Promise.all([
      this.prisma.earthquake.findMany({
        orderBy: { occurredAt: 'desc' },
        take: 50,
      }),
      this.prisma.earthquake.count(),
    ]);

    return { data, meta: { total } };
  }

  // the handleScheduledIngest method is a cron job that runs every 10 seconds to ingest earthquake data from the BMKG API
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleScheduledIngest() {
    this.logger.log('Scheduled ingest from BMKG started');
    const result = await this.ingestFromBmkg();
    this.logger.log(
      `Scheduled ingest from BMKG completed: ${result.fetched} records fetched`,
    );
  }

  // the ingestFromBmkg method fetches earthquake data from the BMKG API and ingests it into the database
  async ingestFromBmkg() {
    const earthquakes = await this.bmkgService.fetchDirasakan();

    let created = 0;
    let skipped = 0;

    // loop through each earthquake record and upsert it into the database
    for (const eq of earthquakes) {
      const result = await this.prisma.earthquake.upsert({
        where: {
          source_externalId: {
            source: eq.source,
            externalId: eq.externalId,
          },
        },
        update: {}, // kalau sudah ada, nggak usah diubah apa-apa
        create: {
          externalId: eq.externalId,
          source: eq.source,
          magnitude: eq.magnitude,
          depthKm: eq.depthKm,
          latitude: eq.latitude,
          longitude: eq.longitude,
          occurredAt: eq.occurredAt,
        },
      });

      // Update the geom column using raw SQL to set the geometry point based on latitude and longitude
      await this.prisma.$executeRaw`
            UPDATE "Earthquake"
            SET geom = ST_SetSRID(ST_MakePoint(${eq.longitude}, ${eq.latitude}), 4326)::geography
            WHERE id = ${result.id}
            `;

      // Increment the created or skipped counter based on whether the record was newly created or already existed
      result ? created++ : skipped++;
    }

    this.logger.log(`Ingest selesai: ${earthquakes.length} data diproses`);

    return {
      fetched: earthquakes.length,
    };
  }
}
