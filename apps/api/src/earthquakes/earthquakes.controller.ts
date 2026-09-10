import { Controller, Get, Post, Query, BadRequestException } from '@nestjs/common';
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
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
  ) {
    const latNum = lat !== undefined ? Number(lat) : -2;
    const lngNum = lng !== undefined ? Number(lng) : 118;
    const radiusKmNum = radiusKm !== undefined ? Number(radiusKm) : 500;

    if (isNaN(latNum) || isNaN(lngNum) || isNaN(radiusKmNum)) {
      throw new BadRequestException(
        'Parameter lat, lng, dan radiusKm harus berupa angka.',
      );
    }
    return this.earthquakesService.findNearby(latNum, lngNum, radiusKmNum);
  }

  @Post('ingest')
  ingest() {
    return this.earthquakesService.ingestFromBmkg();
  }
}
