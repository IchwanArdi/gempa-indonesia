import { Module } from '@nestjs/common';
import { EarthquakesController } from './earthquakes.controller.js';
import { EarthquakesService } from './earthquakes.service.js';
import { BmkgService } from './bmkg.service.js';

@Module({
  controllers: [EarthquakesController],
  providers: [EarthquakesService, BmkgService],
})
export class EarthquakesModule {}
