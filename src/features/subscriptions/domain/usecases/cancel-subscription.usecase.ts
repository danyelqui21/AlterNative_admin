
export class CancelSubscriptionUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(id: string): Promise<void> {
    return this.repository.cancel(id);
  }
}
