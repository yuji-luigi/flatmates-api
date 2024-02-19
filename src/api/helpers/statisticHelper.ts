import Maintenance from '../../models/Maintenance';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { sumUpChecksByDate } from '../aggregation-helpers/checkPipelines';

export async function getHomeStatisticDataForMainSpace(space: ISpace) {
  const query = { space: space._id };
  const summedChecks = await sumUpChecksByDate(query);
  //
  const maintenances = await Maintenance.find(query).sort({ createdAt: -1 });
  return {
    summedChecks,
    maintenances
  };
}
