import { SITE_DESCRIPTION, SITE_NAME } from './config';

interface PageMetaInput {
  title?: string;
  description?: string;
  noindex?: boolean;
}

export function getPageMeta(input: PageMetaInput = {}) {
  const {
    title = SITE_NAME,
    description = SITE_DESCRIPTION,
    noindex = false
  } = input;

  return {
    title,
    description,
    noindex,
    pageTitle: title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`,
    siteName: SITE_NAME
  };
}
