import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ListEventsQueryDto } from './dto/list-events.query.dto';

export type EventsFindAllQuery = {
  category?: string;
  location?: string; // substring search
  dateFrom?: string; // ISO or YYYY-MM-DD
  dateTo?: string; // ISO or YYYY-MM-DD
  sort?: 'date' | 'createdAt' | 'title';
  order?: 'asc' | 'desc';
  limit?: number; // optional pagination
  offset?: number; // optional pagination
};

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
  ) {}

  findAll(query: ListEventsQueryDto = {}): Promise<Event[]> {
    const qb = this.repo.createQueryBuilder('e');

    if (query.category) {
      qb.andWhere('e.category = :category', { category: query.category });
    }

    if (query.location) {
      qb.andWhere('LOWER(e.location) LIKE LOWER(:location)', {
        location: `%${query.location}%`,
      });
    }

    if (query.dateFrom) {
      qb.andWhere('e.date >= :dateFrom', { dateFrom: query.dateFrom });
    }

    if (query.dateTo) {
      qb.andWhere('e.date <= :dateTo', { dateTo: query.dateTo });
    }

    const sortField = query.sort ?? 'date';
    const sortMap: Record<NonNullable<EventsFindAllQuery['sort']>, string> = {
      date: 'e.date',
      createdAt: 'e.createdAt',
      title: 'e.title',
    };

    const order = (query.order ?? 'asc').toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(sortMap[sortField], order);

    // pagination (optional)
    if (typeof query.limit === 'number')
      qb.take(Math.max(1, Math.min(100, query.limit)));
    if (typeof query.offset === 'number') qb.skip(Math.max(0, query.offset));

    return qb.getMany();
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.repo.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`Event ${id} not found`);
    return event;
  }

  async create(dto: CreateEventDto): Promise<Event> {
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

  async recommendSimilar(eventId: number, limit = 5): Promise<Event[]> {
    const base = await this.findOne(eventId);

    const safeLimit = Math.max(1, Math.min(20, limit));

    // window: ±60 days
    const windowDays = 60;
    const from = new Date(base.date);
    from.setDate(from.getDate() - windowDays);

    const to = new Date(base.date);
    to.setDate(to.getDate() + windowDays);

    // 1) primary candidates: same category within date window
    let candidates = await this.repo
      .createQueryBuilder('e')
      .where('e.id != :id', { id: base.id })
      .andWhere('e.category = :category', { category: base.category })
      .andWhere('e.date BETWEEN :from AND :to', { from, to })
      .getMany();

    // 2) fallback: if мало кандидатів — додаємо по локації (ширше вікно)
    if (candidates.length < safeLimit) {
      const widerDays = 120;
      const from2 = new Date(base.date);
      from2.setDate(from2.getDate() - widerDays);

      const to2 = new Date(base.date);
      to2.setDate(to2.getDate() + widerDays);

      const more = await this.repo
        .createQueryBuilder('e')
        .where('e.id != :id', { id: base.id })
        .andWhere('e.location = :location', { location: base.location })
        .andWhere('e.date BETWEEN :from AND :to', { from: from2, to: to2 })
        .getMany();

      // merge unique by id
      const map = new Map<number, Event>();
      for (const e of candidates) map.set(e.id, e);
      for (const e of more) map.set(e.id, e);
      candidates = Array.from(map.values());
    }

    const baseDate = base.date.getTime();
    const baseLoc = (base.location ?? '').toLowerCase();

    const scored = candidates
      .map((e) => {
        let score = 0;

        // category match (в primary кандидатах вже матч, але у fallback може бути не так)
        if (e.category === base.category) score += 60;

        // location match / partial
        const loc = (e.location ?? '').toLowerCase();
        if (loc === baseLoc) score += 25;
        else if (loc.includes(baseLoc) || baseLoc.includes(loc)) score += 12;

        // date closeness (чим ближче - тим краще)
        const diffDays =
          Math.abs(e.date.getTime() - baseDate) / (1000 * 60 * 60 * 24);
        score += Math.max(0, 40 - diffDays); // бонус до 40 балів у межах 40 днів

        return { e, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, safeLimit)
      .map((x) => x.e);

    return scored;
  }
}
