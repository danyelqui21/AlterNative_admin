import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type {
  BlogPost,
  BlogPostFilters,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
} from '../types/blog';

export function useBlogPosts(filters?: BlogPostFilters) {
  return useQuery<BlogPost[]>({
    queryKey: ['admin-blog-posts', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/blog/posts', { params: filters });
      return data?.data ?? data;
    },
  });
}

export function useBlogPost(id: string) {
  return useQuery<BlogPost>({
    queryKey: ['admin-blog-post', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/blog/posts/${id}`);
      return data?.data ?? data;
    },
    enabled: !!id,
  });
}

export function useCreateBlogPost() {
  const qc = useQueryClient();
  return useMutation<BlogPost, Error, CreateBlogPostRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/admin/blog/posts', payload);
      return data?.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
  });
}

export function useUpdateBlogPost() {
  const qc = useQueryClient();
  return useMutation<BlogPost, Error, { id: string; updates: UpdateBlogPostRequest }>({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.put(`/admin/blog/posts/${id}`, updates);
      return data?.data ?? data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      qc.invalidateQueries({ queryKey: ['admin-blog-post', id] });
    },
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/admin/blog/posts/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
  });
}
