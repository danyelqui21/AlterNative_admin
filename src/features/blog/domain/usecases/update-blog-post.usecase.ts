import type { BlogPostEntity, UpdateBlogPostParams } from '../entities/blog-post.entity';

export class UpdateBlogPostUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(id: string, params: UpdateBlogPostParams): Promise<BlogPostEntity> {
    return this.repository.update(id, params);
  }
}
