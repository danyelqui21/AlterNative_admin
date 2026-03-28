import type { BlogPostEntity, BlogPostFilters, CreateBlogPostParams, UpdateBlogPostParams } from '../entities/blog-post.entity';

export interface BlogAdminRepository {
  getAll(filters?: BlogPostFilters): Promise<BlogPostEntity[]>;
  getById(id: string): Promise<BlogPostEntity>;
  create(params: CreateBlogPostParams): Promise<BlogPostEntity>;
  update(id: string, params: UpdateBlogPostParams): Promise<BlogPostEntity>;
  delete(id: string): Promise<void>;
}
