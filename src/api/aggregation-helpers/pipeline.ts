import { PipelineStage } from 'mongoose';
import { FilterOptions } from './../../types/mongoose-types/pipelines/pipeline-type';
export function createFilteredStage(filterOptions: FilterOptions) {
  const newPipeline: PipelineStage[] = [];
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
    newPipeline.push(filterStage);
  });
  return newPipeline;
}
