import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { EarthquakesModule } from './eathquakes/earthquakes.module.js';

@Module({
  imports: [PrismaModule, EarthquakesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
