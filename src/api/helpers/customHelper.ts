import mongoose from 'mongoose';
import logger from '../../lib/logger';
import { Entities } from '../../types/mongoose-types/model-types/Entities';
import { IOrganization } from '../../types/mongoose-types/model-types/organization-interface';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';

export async function getOrganizationOfHead(parentId: string | ISpace, entity: Entities): Promise<IOrganization> {
  try {
    const parent = await mongoose.model(entity).findById(parentId);
    if (parent.isHead) {
      return parent.organization;
    }
    if (parent.organization) {
      return parent.organization;
    }
    // need to be return await to get the result
    return await getOrganizationOfHead(parent.parentId, entity);
  } catch (error) {
    logger.error(error.message || error);
  }
}

interface Statistics {
  checksByMonth: {
    nChecks: number;
    month: Date;
    total: number;
  }[];
  checksByDate:
    | {
        date: Date;
        total: number;
        data: {
          date: Date;
          total: number;
          entity: string;
          name: string;
        }[];
      }[]
    | [];
}
[];

export function handleCreateStatistics({ checksByMonth, checksByDate }: Partial<Statistics>): Statistics {
  const statistics: Statistics = {
    checksByMonth: checksByMonth || [],
    checksByDate: checksByDate || []
  };
  return statistics;
}
