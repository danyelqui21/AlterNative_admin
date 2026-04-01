import type { TheatersAdminDatasource } from '../datasources/theaters-admin.datasource';
import type {
  TheaterEntity,
  SeatingLayoutEntity,
  SeatEntity,
  TheaterFilters,
  CreateTheaterParams,
  UpdateTheaterParams,
  CreateLayoutParams,
} from '../../domain/entities/theater.entity';
import { mapTheaterFromJson, mapLayoutFromJson, mapSeatFromJson } from '../models/theater.model';

export class TheatersAdminRepositoryImpl {
  private datasource: TheatersAdminDatasource;
  constructor(datasource: TheatersAdminDatasource) { this.datasource = datasource; }

  async getAll(filters?: TheaterFilters): Promise<TheaterEntity[]> {
    const models = await this.datasource.getAll(filters);
    return Array.isArray(models) ? models.map(mapTheaterFromJson) : [];
  }

  async getById(id: string): Promise<TheaterEntity> {
    const model = await this.datasource.getById(id);
    return mapTheaterFromJson(model);
  }

  async create(params: CreateTheaterParams): Promise<TheaterEntity> {
    const model = await this.datasource.create(params);
    return mapTheaterFromJson(model);
  }

  async update(id: string, params: UpdateTheaterParams): Promise<TheaterEntity> {
    const model = await this.datasource.update(id, params);
    return mapTheaterFromJson(model);
  }

  async enable(id: string): Promise<TheaterEntity> {
    const model = await this.datasource.enable(id);
    return mapTheaterFromJson(model);
  }

  async disable(id: string): Promise<TheaterEntity> {
    const model = await this.datasource.disable(id);
    return mapTheaterFromJson(model);
  }

  async getLayout(theaterId: string, layoutId: string): Promise<SeatingLayoutEntity> {
    const model = await this.datasource.getLayout(theaterId, layoutId);
    return mapLayoutFromJson(model);
  }

  async createLayout(theaterId: string, params: CreateLayoutParams): Promise<SeatingLayoutEntity> {
    const model = await this.datasource.createLayout(theaterId, params);
    return mapLayoutFromJson(model);
  }

  async updateLayout(theaterId: string, layoutId: string, params: Partial<CreateLayoutParams>): Promise<SeatingLayoutEntity> {
    const model = await this.datasource.updateLayout(theaterId, layoutId, params);
    return mapLayoutFromJson(model);
  }

  async bulkUpsertSeats(theaterId: string, layoutId: string, seats: SeatEntity[]): Promise<SeatEntity[]> {
    const models = await this.datasource.bulkUpsertSeats(theaterId, layoutId, seats);
    return Array.isArray(models) ? models.map(mapSeatFromJson) : [];
  }
}
