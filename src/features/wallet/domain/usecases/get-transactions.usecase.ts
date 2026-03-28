import type { TransactionEntity, TransactionFilters } from '../entities/wallet.entity';

export class GetTransactionsUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(filters?: TransactionFilters): Promise<TransactionEntity[]> {
    return this.repository.getTransactions(filters);
  }
}
