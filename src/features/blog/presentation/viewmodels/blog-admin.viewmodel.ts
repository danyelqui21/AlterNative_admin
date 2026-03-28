import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BlogPostEntity, BlogPostFilters, BlogPostStatus, CreateBlogPostParams, UpdateBlogPostParams } from '../../domain/entities/blog-post.entity';
import { BlogAdminRepositoryImpl } from '../../data/repositories/blog-admin.repository-impl';
import { BlogAdminRemoteDatasource } from '../../data/datasources/blog-admin.remote-datasource';

const datasource = new BlogAdminRemoteDatasource();
const repository = new BlogAdminRepositoryImpl(datasource);

export function useBlogAdminViewModel() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<BlogPostFilters>({});

  const postsQuery = useQuery<BlogPostEntity[]>({
    queryKey: ['admin-blog-posts', filters],
    queryFn: () => repository.getAll(filters),
  });

  const createPost = useMutation<BlogPostEntity, Error, CreateBlogPostParams>({
    mutationFn: (params) => repository.create(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
  });

  const updatePost = useMutation<BlogPostEntity, Error, { id: string; params: UpdateBlogPostParams }>({
    mutationFn: ({ id, params }) => repository.update(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
  });

  const deletePost = useMutation<void, Error, string>({
    mutationFn: (id) => repository.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
  });

  const posts = (postsQuery.data ?? []) as BlogPostEntity[];

  const postsByStatus = useMemo(() => {
    const grouped: Record<BlogPostStatus, BlogPostEntity[]> = {
      draft: [],
      published: [],
      archived: [],
    };
    posts.forEach((p) => {
      grouped[p.status]?.push(p);
    });
    return grouped;
  }, [posts]);

  const totalViews = useMemo(
    () => posts.reduce((sum, p) => sum + p.viewCount, 0),
    [posts],
  );

  const setStatusFilter = useCallback((status?: BlogPostStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 })), []);

  const setSearchFilter = useCallback((search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 })), []);

  const setPage = useCallback((page: number) =>
    setFilters((prev) => ({ ...prev, page })), []);

  return {
    posts,
    postsByStatus,
    totalViews,
    isLoading: postsQuery.isLoading,
    isError: postsQuery.isError,
    error: postsQuery.error,
    filters,
    setFilters,
    setStatusFilter,
    setSearchFilter,
    setPage,
    createPost,
    updatePost,
    deletePost,
  };
}
