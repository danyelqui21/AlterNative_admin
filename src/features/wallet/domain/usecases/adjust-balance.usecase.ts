import type { WalletEntity, AdjustBalanceParams } from '../entities/wallet.entity';

export class AdjustBalanceUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(params: AdjustBalanceParams): Promise<WalletEntity> {
    return this.repository.adjustBalance(params);
  }
}
