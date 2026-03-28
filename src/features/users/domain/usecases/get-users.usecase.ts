import type { UserEntity, UserFilters } from '../entities/user.entity';

export class GetUsersUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(filters?: UserFilters): Promise<UserEntity[]> {
    return this.repository.getAll(filters);
  }
}
