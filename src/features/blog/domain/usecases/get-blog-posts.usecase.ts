import type { BlogPostEntity, BlogPostFilters } from '../entities/blog-post.entity';

export class GetBlogPostsUseCase {
  private repository: any;
  constructor(repository: any) { this.repository = repository; }

  execute(filters?: BlogPostFilters): Promise<BlogPostEntity[]> {
    return this.repository.getAll(filters);
  }
}
