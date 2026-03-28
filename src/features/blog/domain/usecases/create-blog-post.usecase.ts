import type { BlogPostEntity, CreateBlogPostParams } from '../entities/blog-post.entity';

export class CreateBlogPostUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(params: CreateBlogPostParams): Promise<BlogPostEntity> {
    return this.repository.create(params);
  }
}
