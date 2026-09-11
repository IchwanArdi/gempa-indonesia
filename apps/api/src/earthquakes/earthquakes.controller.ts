import {
  Controller,
  Get,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { EarthquakesService } from './earthquakes.service.js';

@Controller('earthquakes')
export class EarthquakesController {
  constructor(private readonly earthquakesService: EarthquakesService) {}

  // The findAll method handles GET requests to the /earthquakes endpoint and returns the latest 50 earthquake records along with the total count of records
  @Get()
  findAll() {
    return this.earthquakesService.findAll();
  }

  // The findNearby method handles GET requests to the /earthquakes/nearby endpoint and returns earthquake records within a specified radius of a given latitude and longitude
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

  // The ingest method handles POST requests to the /earthquakes/ingest endpoint and triggers the ingestion of earthquake data from the BMKG API
  @Post('ingest')
  ingest() {
    return this.earthquakesService.ingestFromBmkg();
  }
}
