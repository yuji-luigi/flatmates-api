import { PipelineStage } from 'mongoose';
import { Entities } from '../../types/mongoose-types/model-types/Entities';

export const LOOKUPS = {
  USERS: {
    $lookup: { from: 'users', localField: 'users', foreignField: '_id', as: 'users' }
  },
  MAINTAINERS: {
    $lookup: { from: 'users', localField: 'maintainer', foreignField: '_id', as: 'maintainer' }
  },
  ROOT_SPACES: {
    $lookup: { from: 'spaces', localField: 'spaces', foreignField: '_id', as: 'spaces' }
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
  spaces: [LOOKUPS.ORGANIZATION, getUnwind('$organization')],
  organizations: [],
  funds: [],
  fundRules: [],
  proposals: [],
  bookmarks: [],
  comments: [],
  tags: [],
  threads: [],
  userSettings: [],
  wallets: [],
  notifications: [],
  maintenances: [LOOKUPS.MAINTAINERS, { $unwind: '$maintainer' }],
  checks: [],
  authTokens: [],
  roles: [],
  accessPermissions: [],
  invitations: [],
  units: [
    {
      $lookup: {
        from: 'spaces',
        localField: 'space',
        foreignField: '_id',
        as: 'space'
      }
    },
    { $unwind: '$space' },
    {
      $lookup: {
        from: 'spaces',
        localField: 'wing',
        foreignField: '_id',
        as: 'wing'
      }
    },
    { $unwind: '$wing' },
    {
      $lookup: {
        from: 'spaces',
        localField: 'floor',
        foreignField: '_id',
        as: 'floor'
      }
    },
    { $unwind: '$floor' },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner'
      }
    },
    {
      $unwind: {
        path: '$owner',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'tenant',
        foreignField: '_id',
        as: 'tenant'
      }
    },
    {
      $unwind: {
        path: '$tenant',
        preserveNullAndEmptyArrays: true
      }
    }
  ]
};
