import User from '../User';

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
  static async find(matchStage: Record<string, any> = {}) {
    return await User.aggregate([
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
          slug: 1
        }
      }
    ]);
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
  }
];
