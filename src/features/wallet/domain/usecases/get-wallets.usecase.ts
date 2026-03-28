import type { WalletEntity, WalletFilters } from '../entities/wallet.entity';

export class GetWalletsUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(filters?: WalletFilters): Promise<WalletEntity[]> {
    return this.repository.getWallets(filters);
  }
}
