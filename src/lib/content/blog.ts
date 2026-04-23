import { getCollection, type CollectionEntry } from 'astro:content';
import { formatTaiwanDate, getCoverImage, type CoverImageData } from '../site/content';

export type BlogEntry = CollectionEntry<'blog'>;

export interface ArticleCardData {
  href: string;
  title: string;
  description: string;
  formattedDate: string;
  cover?: CoverImageData;
}

export interface BlogPageData {
  title: string;
  description: string;
  formattedDate: string;
  formattedUpdatedDate?: string;
  cover?: CoverImageData;
}

function sortPostsByDateDesc(a: BlogEntry, b: BlogEntry) {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}

function buildBlogHref(id: string) {
  return `/blog/${id}/`;
}

export async function getAllPosts() {
  return getCollection('blog');
}

export async function getPublishedPosts() {
  const posts = await getAllPosts();
  return posts.filter((post) => !post.data.draft).sort(sortPostsByDateDesc);
}

export async function getFeaturedPosts(limit = 3) {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.data.featured).slice(0, limit);
}

export async function getPublishedPostPaths() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post }
  }));
}

export function getBlogCover(post: BlogEntry) {
  return getCoverImage(post.data.cover, post.data.coverAlt, post.data.title, '文章封面');
}

export function toArticleCardData(post: BlogEntry): ArticleCardData {
  return {
    href: buildBlogHref(post.id),
    title: post.data.title,
    description: post.data.description,
    formattedDate: formatTaiwanDate(post.data.pubDate),
    cover: getBlogCover(post)
  };
}

export function toBlogPageData(post: BlogEntry): BlogPageData {
  return {
    title: post.data.title,
    description: post.data.description,
    formattedDate: formatTaiwanDate(post.data.pubDate),
    formattedUpdatedDate: post.data.updatedDate ? formatTaiwanDate(post.data.updatedDate) : undefined,
    cover: getBlogCover(post)
  };
}
