import type {
  TheaterEntity,
  SeatingLayoutEntity,
  SeatEntity,
  TheaterFilters,
  CreateTheaterParams,
  UpdateTheaterParams,
  CreateLayoutParams,
} from '../entities/theater.entity';

export interface TheatersAdminRepository {
  getAll(filters?: TheaterFilters): Promise<TheaterEntity[]>;
  getById(id: string): Promise<TheaterEntity>;
  create(params: CreateTheaterParams): Promise<TheaterEntity>;
  update(id: string, params: UpdateTheaterParams): Promise<TheaterEntity>;
  enable(id: string): Promise<TheaterEntity>;
  disable(id: string): Promise<TheaterEntity>;
  getLayout(theaterId: string, layoutId: string): Promise<SeatingLayoutEntity>;
  createLayout(theaterId: string, params: CreateLayoutParams): Promise<SeatingLayoutEntity>;
  updateLayout(theaterId: string, layoutId: string, params: Partial<CreateLayoutParams>): Promise<SeatingLayoutEntity>;
  bulkUpsertSeats(theaterId: string, layoutId: string, seats: SeatEntity[]): Promise<SeatEntity[]>;
}
