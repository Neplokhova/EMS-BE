import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getEvents(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @Get(':id')
  getEvent(@Param('id', ParseIntPipe) id: number): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @Post()
  createEvent(@Body() body: CreateEventDto): Promise<Event> {
    return this.eventsService.create(body);
  }

  @Patch(':id')
  updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateEventDto,
  ): Promise<Event> {
    return this.eventsService.update(id, body);
  }

  @Delete(':id')
  deleteEvent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ deleted: true }> {
    return this.eventsService.remove(id);
  }
}
