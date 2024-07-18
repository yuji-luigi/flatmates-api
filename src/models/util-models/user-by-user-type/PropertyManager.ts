import { PipelineStage } from 'mongoose';
import { FilterOptions } from '../../../types/mongoose-types/pipelines/pipeline-type';
import { AbstractUserByUserType, commonPipeline } from './AbstractUserByUserType';
import User from '../../User';
import { ErrorCustom } from '../../../lib/ErrorCustom';

export class PropertyManager extends AbstractUserByUserType {
  protected static roleName = 'property_manager' as const;

  // static async find(options?: { matchStage?: Record<string, any>; fieldFilterOptions?: FilterOptions; additionalPipelines?: PipelineStage[] }) {
  //   const { matchStage = {}, fieldFilterOptions } = options || {};
  //   const pipeline: PipelineStage[] = [
  //     ...commonPipeline({ roleName: this.roleName }),

  //     {
  //       $match: {
  //         'userRole.name': this.roleName,
  //         ...matchStage
  //       }
  //     },
  //     {
  //       $project: {
  //         _id: 1,
  //         name: 1,
  //         surname: 1,
  //         email: 1,
  //         active: 1,
  //         // role: '$userRole.name',
  //         // isPublicProfile: '$userRegistry.isPublic',
  //         cover: {
  //           url: '$avatar.url',
  //           fileName: '$avatar.fileName'
  //         },
  //         avatar: {
  //           url: '$avatar.url',
  //           fileName: '$avatar.fileName'
  //         },
  //         spaces: '$accessPermissions.space',
  //         jobTitle: '$userRegistry.jobTitle',
  //         slug: 1
  //       }
  //     }
  //   ];
  //   if (fieldFilterOptions) {
  //     Object.entries(fieldFilterOptions).forEach(([fieldPath, condition]) => {
  //       const filterStage: PipelineStage = {
  //         $addFields: {
  //           [fieldPath]: {
  //             $filter: {
  //               input: `$${fieldPath}`,
  //               as: fieldPath.split('.').slice(-1)[0], // Extract the field name from the path
  //               cond: condition
  //             }
  //           }
  //         }
  //       };
  //       pipeline.push(filterStage);
  //     });
  //   }
  //   if (options?.additionalPipelines) {
  //     pipeline.push(...options.additionalPipelines);
  //   }
  //   // pipeline.push({
  //   //   $match: {
  //   //     spaces: { $ne: [] } // Ensures the array is not empty
  //   //   }
  //   // });

  //   return await User.aggregate(pipeline).catch((e) => {
  //     console.error(e.stack);
  //     throw new ErrorCustom('Error fetching users by user type', 500);
  //   });
  // }
}
