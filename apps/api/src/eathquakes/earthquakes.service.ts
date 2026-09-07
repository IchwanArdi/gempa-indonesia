import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BmkgService } from './bmkg.service.js';

@Injectable()
export class EarthquakesService {
  private readonly logger = new Logger(EarthquakesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bmkgService: BmkgService,
  ) {}

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

  async ingestFromBmkg() {
    const earthquakes = await this.bmkgService.fetchDirasakan();

    let created = 0;
    let skipped = 0;

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

      await this.prisma.$executeRaw`
            UPDATE "Earthquake"
            SET geom = ST_SetSRID(ST_MakePoint(${eq.longitude}, ${eq.latitude}), 4326)::geography
            WHERE id = ${result.id}
            `;

      result ? created++ : skipped++;
    }

    this.logger.log(`Ingest selesai: ${earthquakes.length} data diproses`);

    return {
      fetched: earthquakes.length,
    };
  }
}
