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

  async getRecommendations(eventId: number): Promise<Event[]> {
    const baseEvent = await this.findOne(eventId);

    // беремо події +/- 30 днів від дати базової
    const from = new Date(baseEvent.date);
    from.setDate(from.getDate() - 30);

    const to = new Date(baseEvent.date);
    to.setDate(to.getDate() + 30);

    return this.repo
      .createQueryBuilder('event')
      .where('event.id != :id', { id: eventId })
      .andWhere('event.date BETWEEN :from AND :to', { from, to })
      .orderBy('ABS(EXTRACT(EPOCH FROM (event.date - :baseDate)))', 'ASC')
      .setParameter('baseDate', baseEvent.date)
      .limit(5)
      .getMany();
  }
}
