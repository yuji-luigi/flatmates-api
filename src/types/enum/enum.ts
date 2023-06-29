export type TPublishStatus = 'draft' | 'published' | 'deleted';

export interface IPublishStatus {
  [key: string]: string;
}
export enum aa {
  draft,
  published,
  deleted
}

export enum USER_ROLES_ENUM {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export const USER_ROLES = ['admin', 'user', 'super_admin'];
export type USER_ROLES = (typeof USER_ROLES)[number];

export const MAINTAINER_TYPES = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Gardener', 'Cleaner', 'Other'] as const;
