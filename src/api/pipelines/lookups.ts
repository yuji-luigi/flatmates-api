import { PipelineStage } from 'mongoose';

export const LOOKUPS = {
  USERS: {
    $lookup: { from: 'users', localField: 'users', foreignField: '_id', as: 'users' }
  },
  ROOT_SPACES: {
    $lookup: { from: 'spaces', localField: 'rootSpaces', foreignField: '_id', as: 'rootSpaces' }
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
  }
} as const;

export const UNWIND: PipelineStage.FacetPipelineStage = {
  $unwind: {
    path: '$membersData.avatar',
    preserveNullAndEmptyArrays: true
  }
};
