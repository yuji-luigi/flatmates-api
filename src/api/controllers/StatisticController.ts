import logger from '../../lib/logger';
import httpStatus from 'http-status';
import { sumUpChecksByMonth } from '../aggregation-helpers/checkPipelines';
import { RequestCustom } from '../../types/custom-express/express-custom';
import { Response } from 'express';
import { handleCreateStatistics } from '../helpers/customHelper';
import { getValidFieldsAndConvertToBoolean } from '../helpers/mongoose.helper';

export async function sendStatisticsByMonthToClient(req: RequestCustom, res: Response) {
  try {
    const { from, to } = req.query;
    const fromToQuery = formatFromToQuery({ from, to });
    req.query = { ...req.query, ...fromToQuery };
    const query = getValidFieldsAndConvertToBoolean({ entity: 'checks', query: req.query });
    const checksByMonth = await sumUpChecksByMonth(query);

    res.status(httpStatus.OK).json({
      data: handleCreateStatistics({
        checksByMonth
      }),
      success: true,
      collection: null
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: error.message || error,
      success: false
    });
  }
}
interface DateRangeQuery {
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}
function formatFromToQuery({ from, to }: { from: string; to: string }) {
  let query: DateRangeQuery = from
    ? {
        createdAt: { $gte: new Date(from) }
      }
    : {};
  query = to
    ? {
        createdAt: {
          ...query.createdAt,
          $lte: new Date(to)
        }
      }
    : query;
  return query;
}
