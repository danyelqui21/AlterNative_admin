import type { AdminUserEntity } from "../entities/admin-user.entity";

export class GetMeUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(): Promise<AdminUserEntity> {
    return this.repository.getMe();
  }
}
