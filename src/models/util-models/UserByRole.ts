import { FilterOptions } from '../../types/mongoose-types/pipelines/pipeline-type';
import { PipelineStage } from 'mongoose';
import User from '../User';
import { createFilteredStage } from '../../api/aggregation-helpers/pipeline';
import { ObjectId } from 'bson';
import { RoleFields } from '../../types/mongoose-types/model-types/role-interface';

// placeholder for the deprecated mongoose model
export abstract class UserByRole {
  protected static roleName: RoleFields;
  static async findById(id: ObjectId, params?: { matchStage: Record<string, any>; fieldFilterOptions?: FilterOptions }) {
    const { matchStage = {}, fieldFilterOptions } = params || {};
    let pipeline: PipelineStage[] = [
      ...maintainerPipeline,
      {
        $match: {
          'userRole.name': this.roleName,
          _id: id,
          ...matchStage
        }
      },
      { $limit: 1 },
      {
        $project: {
          _id: 1,
          name: 1,
          surname: 1,
          email: 1,
          // role: '$userRole.name',
          // isPublicProfile: '$userRegistry.isPublic',
          cover: {
            url: '$avatar.url',
            fileName: '$avatar.fileName'
          },
          avatar: {
            url: '$avatar.url',
            fileName: '$avatar.fileName'
          },
          spaces: '$accessPermissions.space',

          slug: 1
        }
      }
    ];

    if (fieldFilterOptions) {
      const filterStage = createFilteredStage(fieldFilterOptions);
      pipeline = pipeline.concat(filterStage);
    }

    const [maintainer] = await User.aggregate(pipeline);
    return maintainer;
  }
  static async findOne(params?: { matchStage: Record<string, any>; fieldFilterOptions?: FilterOptions }) {
    const { matchStage = {}, fieldFilterOptions } = params || {};
    let pipeline: PipelineStage[] = [
      ...maintainerPipeline,
      {
        $match: {
          'userRole.name': this.roleName,
          ...matchStage
        }
      },
      { $limit: 1 },
      {
        $project: {
          _id: 1,
          name: 1,
          surname: 1,
          email: 1,
          // role: '$userRole.name',
          // isPublicProfile: '$userRegistry.isPublic',
          cover: {
            url: '$avatar.url',
            fileName: '$avatar.fileName'
          },
          avatar: {
            url: '$avatar.url',
            fileName: '$avatar.fileName'
          },
          spaces: '$accessPermissions.space',

          slug: 1
        }
      }
    ];

    if (fieldFilterOptions) {
      const filterStage = createFilteredStage(fieldFilterOptions);
      pipeline = pipeline.concat(filterStage);
    }

    const [maintainer] = await User.aggregate(pipeline);
    return maintainer;
  }
  static async find(options?: { matchStage?: Record<string, any>; fieldFilterOptions?: FilterOptions }) {
    const { matchStage = {}, fieldFilterOptions } = options || {};
    const pipeline: PipelineStage[] = [
      ...maintainerPipeline,

      {
        $match: {
          'userRole.name': this.roleName,
          ...matchStage
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          surname: 1,
          email: 1,
          // role: '$userRole.name',
          // isPublicProfile: '$userRegistry.isPublic',
          cover: {
            url: '$avatar.url',
            fileName: '$avatar.fileName'
          },
          avatar: {
            url: '$avatar.url',
            fileName: '$avatar.fileName'
          },
          spaces: '$accessPermissions.space',
          jobTitle: '$userRegistry.jobTitle',
          slug: 1
        }
      }
    ];
    if (fieldFilterOptions) {
      Object.entries(fieldFilterOptions).forEach(([fieldPath, condition]) => {
        const filterStage: PipelineStage = {
          $addFields: {
            [fieldPath]: {
              $filter: {
                input: `$${fieldPath}`,
                as: fieldPath.split('.').slice(-1)[0], // Extract the field name from the path
                cond: condition
              }
            }
          }
        };
        pipeline.push(filterStage);
      });
    }
    return await User.aggregate(pipeline);
  }
}

export const maintainerPipeline = [
  {
    $lookup: {
      from: 'userregistries',
      localField: '_id',
      foreignField: 'user',
      as: 'userRegistry'
    }
  },
  {
    $unwind: '$userRegistry'
  },

  {
    $lookup: {
      from: 'uploads',
      localField: 'avatar',
      foreignField: '_id',
      as: 'avatar'
    }
  },
  {
    $unwind: {
      path: '$avatar',
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $lookup: {
      from: 'uploads',
      localField: 'cover',
      foreignField: '_id',
      as: 'cover'
    }
  },
  {
    $unwind: {
      path: '$cover',
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $lookup: {
      from: 'roles',
      localField: 'userRegistry.role',
      foreignField: '_id',
      as: 'userRole'
    }
  },
  {
    $lookup: {
      from: 'accesspermissions',
      localField: '_id', // Assuming this is the root document _id that should match `user` in accessPermissions
      foreignField: 'user',
      as: 'accessPermissions',
      pipeline: [
        {
          $match: {
            disabled: false // Only include accessPermissions documents where disabled is true
          }
        },
        {
          $lookup: {
            from: 'spaces',
            localField: 'space',
            foreignField: '_id',
            as: 'space'
          }
        },
        {
          $unwind: {
            path: '$space',
            preserveNullAndEmptyArrays: true // Optional: Adjust based on whether you always expect a space or not
          }
        }
        // Potentially other operations on the space document
      ]
    }
  }
];
