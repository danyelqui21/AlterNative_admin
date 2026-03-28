import type { BlogPostEntity } from '../../domain/entities/blog-post.entity';

export interface BlogPostModel {
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
  status: string;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function mapBlogPostFromJson(json: any): BlogPostEntity {
  return {
    id: json?.id ?? '',
    title: json?.title ?? '',
    slug: json?.slug ?? '',
    excerpt: json?.excerpt ?? '',
    content: json?.content ?? '',
    coverImageUrl: json?.coverImageUrl ?? undefined,
    authorId: json?.authorId ?? '',
    authorName: json?.authorName ?? '',
    category: json?.category ?? '',
    tags: Array.isArray(json?.tags) ? json.tags : undefined,
    status: json?.status ?? 'draft',
    viewCount: Number(json?.viewCount) || 0,
    publishedAt: json?.publishedAt ?? undefined,
    createdAt: json?.createdAt ?? '',
    updatedAt: json?.updatedAt ?? '',
  };
}
