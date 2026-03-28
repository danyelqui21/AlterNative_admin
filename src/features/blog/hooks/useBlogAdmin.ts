import { useState, useMemo } from 'react';
import {
  useBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
} from '../api/blog-api';
import type { BlogPost, BlogPostFilters, BlogPostStatus } from '../types/blog';

export function useBlogAdmin() {
  const [filters, setFilters] = useState<BlogPostFilters>({});

  const postsQuery = useBlogPosts(filters);
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();

  const posts = (postsQuery.data ?? []) as BlogPost[];

  const postsByStatus = useMemo(() => {
    const grouped: Record<BlogPostStatus, BlogPost[]> = {
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

  const setStatusFilter = (status?: BlogPostStatus) =>
    setFilters((prev) => ({ ...prev, status, page: 1 }));

  const setSearchFilter = (search?: string) =>
    setFilters((prev) => ({ ...prev, search, page: 1 }));

  const setPage = (page: number) =>
    setFilters((prev) => ({ ...prev, page }));

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
