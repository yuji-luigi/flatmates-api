import { PipelineStage } from 'mongoose';
import { Entities } from '../../types/mongoose-types/model-types/Entities';

export const LOOKUPS = {
  USERS: {
    $lookup: { from: 'users', localField: 'users', foreignField: '_id', as: 'users' }
  },
  MAINTAINERS: {
    $lookup: { from: 'maintainers', localField: 'maintainer', foreignField: '_id', as: 'maintainer' }
  },
  ROOT_SPACES: {
    $lookup: { from: 'spaces', localField: 'spaces', foreignField: '_id', as: 'spaces' }
  },
  ADMINS: {
    $lookup: {
      from: 'users',
      localField: 'admins',
      foreignField: '_id',
      as: 'admins'
    }
  },
  ORGANIZATION: {
    $lookup: {
      from: 'organizations',
      localField: 'organization',
      foreignField: '_id',
      as: 'organization'
    }
  },
  ORGANIZATIONS: {
    $lookup: {
      from: 'organizations',
      localField: 'organizations',
      foreignField: '_id',
      as: 'organizations'
    }
  }
} as const;

export const UNWIND: PipelineStage.FacetPipelineStage = {
  $unwind: {
    path: '$membersData.avatar',
    preserveNullAndEmptyArrays: true
  }
};
export const getUnwind = (path: string): PipelineStage.FacetPipelineStage => ({
  $unwind: {
    path,
    preserveNullAndEmptyArrays: true
  }
});

export const LOOKUP_PIPELINE_STAGES: Record<Entities, PipelineStage.FacetPipelineStage[]> = {
  spaceTags: [],
  users: [LOOKUPS.ROOT_SPACES],
  spaces: [LOOKUPS.ADMINS, getUnwind('$admins'), LOOKUPS.ORGANIZATION, getUnwind('$organization')],
  organizations: [],
  funds: [],
  fundRules: [],
  instances: [],
  proposals: [],
  bookmarks: [],
  comments: [],
  tags: [],
  threads: [],
  userSettings: [],
  wallets: [],
  notifications: [],
  maintenances: [LOOKUPS.MAINTAINERS, { $unwind: '$maintainer' }],
  maintainers: [],
  checks: [],
  'auth-tokens': [],
  role: []
};
