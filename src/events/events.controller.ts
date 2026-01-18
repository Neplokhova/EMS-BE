import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ListEventsQueryDto } from './dto/list-events.query.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get events (filter/sort/paginate)' })
  @ApiResponse({ status: 200, description: 'List of events' })
  getEvents(@Query() query: ListEventsQueryDto): Promise<Event[]> {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by id' })
  @ApiResponse({ status: 200, description: 'Event' })
  getEvent(@Param('id', ParseIntPipe) id: number): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @Get(':id/recommendations')
  @ApiOperation({ summary: 'Get similar events (recommendations)' })
  @ApiResponse({ status: 200, description: 'Recommended events' })
  getRecommendations(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
  ): Promise<Event[]> {
    const n = limit ? Number.parseInt(limit, 10) : 5;
    return this.eventsService.recommendSimilar(id, Number.isFinite(n) ? n : 5);
  }

  @Post()
  @ApiOperation({ summary: 'Create event' })
  @ApiResponse({ status: 201, description: 'Created event' })
  createEvent(@Body() body: CreateEventDto): Promise<Event> {
    return this.eventsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event' })
  @ApiResponse({ status: 200, description: 'Updated event' })
  updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateEventDto,
  ): Promise<Event> {
    return this.eventsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event' })
  @ApiResponse({ status: 200, description: 'Delete result' })
  deleteEvent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ deleted: true }> {
    return this.eventsService.remove(id);
  }
}
