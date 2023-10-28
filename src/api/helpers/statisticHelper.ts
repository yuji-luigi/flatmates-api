import Maintenance from '../../models/Maintenance';
import { ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { sumUpChecksByDate } from '../aggregation-helpers/checkPipelines';

export async function getHomeStatisticDataForMainSpace(mainSpace: ISpace) {
  const query = { space: mainSpace._id };
  const summedChecks = await sumUpChecksByDate(query);
  //
  const maintenances = await Maintenance.find(query).sort({ createdAt: -1 });
  return {
    summedChecks,
    maintenances
  };
}
