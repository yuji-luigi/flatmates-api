import { PipelineStage } from 'mongoose';
import User from '../User';
type FilterOptions = Record<string, any>;

// placeholder for the deprecated mongoose model
export class Maintainer {
  // public static findOne()

  static async findOne(matchStage: Record<string, any> = {}) {
    const [maintainer] = await User.aggregate([
      ...maintainerPipeline,
      {
        $match: {
          'userRole.name': 'Maintainer',
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
          slug: 1
        }
      }
    ]);

    return maintainer;
  }
  static async find(options?: { matchStage?: Record<string, any>; filterOptions?: FilterOptions }) {
    const { matchStage = {}, filterOptions = {} } = options || {};
    const pipeline: PipelineStage[] = [
      ...maintainerPipeline,

      {
        $match: {
          'userRole.name': 'Maintainer',
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
          slug: 1
        }
      }
    ];
    Object.entries(filterOptions).forEach(([fieldPath, condition]) => {
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
    return await User.aggregate(pipeline);
  }
  static findById(param?: any) {
    console.error('Not implemented');
    return param;
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
