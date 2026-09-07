// This service is responsible for managing the lifecycle of the PrismaClient instance.
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
// The PrismaService class extends the PrismaClient and implements the OnModuleInit and OnModuleDestroy interfaces to handle connection management.
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // The constructor initializes the PrismaClient with a PostgreSQL adapter using a connection pool.
  constructor() {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Create a new instance of the PrismaPg adapter with the connection pool.
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
