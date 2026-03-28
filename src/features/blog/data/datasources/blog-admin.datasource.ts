import type { BlogPostFilters, CreateBlogPostParams, UpdateBlogPostParams } from '../../domain/entities/blog-post.entity';
import type { BlogPostModel } from '../models/blog-post.model';

export interface BlogAdminDatasource {
  getAll(filters?: BlogPostFilters): Promise<BlogPostModel[]>;
  getById(id: string): Promise<BlogPostModel>;
  create(params: CreateBlogPostParams): Promise<BlogPostModel>;
  update(id: string, params: UpdateBlogPostParams): Promise<BlogPostModel>;
  delete(id: string): Promise<void>;
}
