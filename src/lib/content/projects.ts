import { getCollection, type CollectionEntry } from 'astro:content';
import { formatReadingTime } from '../../utils/readingTime';
import { getCoverImage, type CoverImageData } from '../site/content';

export type ProjectEntry = CollectionEntry<'projects'>;

export interface ProjectCardData {
  href: string;
  title: string;
  description: string;
  readingTime: string;
  cover?: CoverImageData;
}

export interface ProjectPageData {
  title: string;
  description: string;
  readingTime: string;
  summary: string[];
  repo?: string;
  demo?: string;
  cover?: CoverImageData;
  tags: string[];
}

function sortProjectsByOrderAsc(a: ProjectEntry, b: ProjectEntry) {
  return a.data.order - b.data.order;
}

function buildProjectHref(id: string) {
  return `/projects/${id}/`;
}

export async function getAllProjects() {
  return getCollection('projects');
}

export async function getPublishedProjects() {
  const projects = await getAllProjects();
  return projects.filter((project) => !project.data.draft).sort(sortProjectsByOrderAsc);
}

export async function getFeaturedProjects(limit = 3) {
  const projects = await getPublishedProjects();
  return projects.filter((project) => project.data.featured).slice(0, limit);
}

export async function getPublishedProjectPaths() {
  const projects = await getPublishedProjects();
  return projects.map((project) => ({
    params: { slug: project.id },
    props: { project }
  }));
}

export function getProjectCover(project: ProjectEntry) {
  return getCoverImage(project.data.cover, project.data.coverAlt, project.data.title, '專案封面');
}

export function toProjectCardData(project: ProjectEntry): ProjectCardData {
  return {
    href: buildProjectHref(project.id),
    title: project.data.title,
    description: project.data.description,
    readingTime: formatReadingTime(project.body),
    cover: getProjectCover(project)
  };
}

export function toProjectPageData(project: ProjectEntry): ProjectPageData {
  return {
    title: project.data.title,
    description: project.data.description,
    readingTime: formatReadingTime(project.body),
    summary: project.data.summary,
    repo: project.data.repo,
    demo: project.data.demo,
    cover: getProjectCover(project),
    tags: project.data.tags
  };
}
