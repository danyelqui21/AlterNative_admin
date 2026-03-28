import type { BlogAdminRepository } from '../../domain/repositories/blog-admin.repository';
import type { BlogAdminDatasource } from '../datasources/blog-admin.datasource';
import type { BlogPostEntity, BlogPostFilters, CreateBlogPostParams, UpdateBlogPostParams } from '../../domain/entities/blog-post.entity';
import { mapBlogPostFromJson } from '../models/blog-post.model';

export class BlogAdminRepositoryImpl {
  private datasource: BlogAdminDatasource;
  constructor(datasource: BlogAdminDatasource) { this.datasource = datasource; }

  async getAll(filters?: BlogPostFilters): Promise<BlogPostEntity[]> {
    const models = await this.datasource.getAll(filters);
    return Array.isArray(models) ? models.map(mapBlogPostFromJson) : [];
  }

  async getById(id: string): Promise<BlogPostEntity> {
    const model = await this.datasource.getById(id);
    return mapBlogPostFromJson(model);
  }

  async create(params: CreateBlogPostParams): Promise<BlogPostEntity> {
    const model = await this.datasource.create(params);
    return mapBlogPostFromJson(model);
  }

  async update(id: string, params: UpdateBlogPostParams): Promise<BlogPostEntity> {
    const model = await this.datasource.update(id, params);
    return mapBlogPostFromJson(model);
  }

  async delete(id: string): Promise<void> {
    await this.datasource.delete(id);
  }
}
