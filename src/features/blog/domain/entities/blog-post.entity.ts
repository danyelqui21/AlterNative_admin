export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface BlogPostEntity {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  authorId: string;
  authorName: string;
  category: string;
  tags?: string[];
  status: BlogPostStatus;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogPostParams {
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  category: string;
  tags?: string[];
  status?: BlogPostStatus;
}

export interface UpdateBlogPostParams extends Partial<CreateBlogPostParams> {}

export interface BlogPostFilters {
  status?: BlogPostStatus;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}
