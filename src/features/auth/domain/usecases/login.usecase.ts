import type { AdminLoginParams, AdminAuthResponse } from '../entities/admin-user.entity';

export class LoginUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(params: AdminLoginParams): Promise<AdminAuthResponse> {
    return this.repository.login(params);
  }
}
