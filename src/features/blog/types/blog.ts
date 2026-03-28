export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface BlogPost {
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

export interface CreateBlogPostRequest {
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  category: string;
  tags?: string[];
  status?: BlogPostStatus;
}

export interface UpdateBlogPostRequest extends Partial<CreateBlogPostRequest> {}

export interface BlogPostFilters {
  status?: BlogPostStatus;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}
