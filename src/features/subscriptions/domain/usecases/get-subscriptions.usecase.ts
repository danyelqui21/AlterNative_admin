import type { SubscriptionEntity, SubscriptionFilters } from '../entities/subscription.entity';

export class GetSubscriptionsUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(filters?: SubscriptionFilters): Promise<SubscriptionEntity[]> {
    return this.repository.getAll(filters);
  }
}
