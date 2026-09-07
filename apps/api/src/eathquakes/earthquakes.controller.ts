import { Controller, Get, Post } from '@nestjs/common';
import { EarthquakesService } from './earthquakes.service.js';

@Controller('earthquakes')
export class EarthquakesController {
  constructor(private readonly earthquakesService: EarthquakesService) {}

  @Get()
  findAll() {
    return this.earthquakesService.findAll();
  }

  @Post('ingest')
  ingest() {
    return this.earthquakesService.ingestFromBmkg();
  }
}
