import { PipelineStage } from 'mongoose';
import { ErrorCustom } from '../../../lib/ErrorCustom';
import { FilterOptions } from '../../../types/mongoose-types/pipelines/pipeline-type';
import User from '../../User';
import { AbstractUserByUserType } from './AbstractUserByUserType';

export class Inhabitant extends AbstractUserByUserType {
  protected static roleName = 'inhabitant' as const;

  static async find(options?: { matchStage?: Record<string, any>; fieldFilterOptions?: FilterOptions; additionalPipelines?: PipelineStage[] }) {
    const pipeline = this.buildPipeline({
      matchStage: options?.matchStage,
      fieldFilterOptions: options?.fieldFilterOptions,
      additionalPipelines: [...(options?.additionalPipelines || [])]
    });

    const result = await User.aggregate(pipeline).catch((e) => {
      console.error(e.stack);
      throw new ErrorCustom('Error fetching inhabitants by user type', 500);
    });
    return result;
  }
}
