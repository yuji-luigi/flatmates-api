export type TPublishStatus = 'draft' | 'published' | 'deleted';

export interface IPublishStatus {
  [key: string]: string;
}
export enum aa {
  draft,
  published,
  deleted
}

export const MAINTAINER_TYPES = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Gardener', 'Cleaner', 'Other'] as const;
