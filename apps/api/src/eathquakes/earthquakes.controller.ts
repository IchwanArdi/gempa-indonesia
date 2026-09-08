import { Controller, Get, Post, Query } from '@nestjs/common';
import { EarthquakesService } from './earthquakes.service.js';

@Controller('earthquakes')
export class EarthquakesController {
  constructor(private readonly earthquakesService: EarthquakesService) {}

  @Get()
  findAll() {
    return this.earthquakesService.findAll();
  }

  @Get('nearby')
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radiusKm') radiusKm: string,
  ) {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    const radiusKmNum = Number(radiusKm);

    if (isNaN(latNum) || isNaN(lngNum) || isNaN(radiusKmNum)) {
      throw new Error(
        'Invalid query parameters. lat, lng, and radiusKm must be numbers.',
      );
    }
    return this.earthquakesService.findNearby(latNum, lngNum, radiusKmNum);
  }

  @Post('ingest')
  ingest() {
    return this.earthquakesService.ingestFromBmkg();
  }
}
