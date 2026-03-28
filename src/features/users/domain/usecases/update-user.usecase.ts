import type { UserEntity, UpdateUserParams } from '../entities/user.entity';

export class UpdateUserUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(id: string, params: UpdateUserParams): Promise<UserEntity> {
    return this.repository.update(id, params);
  }
}
