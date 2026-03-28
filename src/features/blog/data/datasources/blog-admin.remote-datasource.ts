import { apiClient } from '@/core/api/api-client';
import type { BlogAdminDatasource } from './blog-admin.datasource';
import type { BlogPostModel } from '../models/blog-post.model';
import type { BlogPostFilters, CreateBlogPostParams, UpdateBlogPostParams } from '../../domain/entities/blog-post.entity';

export class BlogAdminRemoteDatasource {
  async getAll(filters?: BlogPostFilters): Promise<BlogPostModel[]> {
    const { data } = await apiClient.get('/admin/blog/posts', { params: filters });
    return data?.data ?? data;
  }

  async getById(id: string): Promise<BlogPostModel> {
    const { data } = await apiClient.get(`/admin/blog/posts/${id}`);
    return data?.data ?? data;
  }

  async create(params: CreateBlogPostParams): Promise<BlogPostModel> {
    const { data } = await apiClient.post('/admin/blog/posts', params);
    return data?.data ?? data;
  }

  async update(id: string, params: UpdateBlogPostParams): Promise<BlogPostModel> {
    const { data } = await apiClient.put(`/admin/blog/posts/${id}`, params);
    return data?.data ?? data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/blog/posts/${id}`);
  }
}
