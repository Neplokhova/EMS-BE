import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
  ) {}

  findAll(): Promise<Event[]> {
    return this.repo.find({ order: { date: 'ASC' } });
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.repo.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`Event ${id} not found`);
    return event;
  }

  create(dto: CreateEventDto): Promise<Event> {
    const event = this.repo.create({
      ...dto,
      date: new Date(dto.date),
    });
    return this.repo.save(event);
  }

  async update(id: number, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    const merged = this.repo.merge(event, {
      ...dto,
      ...(dto.date ? { date: new Date(dto.date) } : {}),
    });

    return this.repo.save(merged);
  }

  async remove(id: number): Promise<{ deleted: true }> {
    const event = await this.findOne(id);
    await this.repo.remove(event);
    return { deleted: true };
  }
}
