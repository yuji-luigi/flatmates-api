import mongoose, { SortOrder } from 'mongoose';
import Thread from '../../models/Thread';
import { ObjectId } from 'mongodb';
// todo: aggregation method
interface LookUpQueryInterface {
  [key: string]: mongoose.PipelineStage.FacetPipelineStage[];
}

export const LOOKUP_QUERY: LookUpQueryInterface = {
  spaces: [
    { $lookup: { from: 'users', localField: 'admins', foreignField: '_id', as: 'admins' } },
    { $lookup: { from: 'organizations', localField: 'organization', foreignField: '_id', as: 'organization' } },
    {
      $unwind: '$organization'
    }
  ]
};

interface PaginatedResult {
  paginatedResult: Array<any>;
}
[];
interface Counts {
  counts: {
    total: number;
  }[];
}
[];

type ResultAggregateWithPagination = PaginatedResult & Counts;

/**
 *
 * @returns {[Document[],Counts]}
 */
export async function aggregateWithPagination(query: any, entity: string): Promise<ResultAggregateWithPagination[]> {
  /** define skip value, then delete as follows */
  const limit = 10;
  let skip = +query.skip - 1 <= 0 ? 0 : (+query.skip - 1) * limit;
  skip = isNaN(skip) ? 0 : skip;
  delete query.skip; // not good way for functional programming. set new query object for querying the DB
  delete query.limit;

  if (query.parentId) {
    query.parentId = new mongoose.Types.ObjectId(query.parentId);
  }
  const validFields = Object.keys(mongoose.model(entity).schema.paths);

  for (const key in query) {
    if (!validFields.includes(key)) {
      delete query[key];
    } else {
      query[key] === 'true' ? (query[key] = true) : query[key];
      query[key] === 'false' ? (query[key] = false) : query[key];
    }
  }

  const data = await mongoose.model(entity).aggregate<ResultAggregateWithPagination>([
    {
      $facet: {
        paginatedResult: [{ $match: query }, { $skip: skip }, { $limit: limit }],

        counts: [{ $match: query }, { $count: 'total' }]
      }
    }
  ]);
  return data;
}

type SortQuery = { [key: string]: SortOrder };
/* |string |  { $meta: 'textScore' } | [string, SortOrder][];
 */

export async function getThreadsForPlatForm({
  /* entity ,*/ query /* sortQuery = {} */
}: {
  entity: Entities;
  query?: object;
  sortQuery?: SortQuery;
}) {
  const threads = await Thread.find<MongooseBaseModel<any, any>>(query).sort({
    isImportant: -1,
    createdAt: -1
  });

  if (threads.length) {
    if (threads[0].setStorageUrlToModel) {
      for (const item of threads) {
        await item.setStorageUrlToModel();
      }
    }
  }
  return threads;
}
/** @description not pure function it is mutating the req.query object. Since query id can be a ObjectId that canot be cloned by structuredClone
 * takes req.query object and check if there are objectId in a string type. then converts them to ObjectId of mongoDB */
export function convert_idToMongooseId(query: Record<string, string | ObjectId>) {
  // const req.query = structuredClone(query);
  if (query.parentId && typeof query.parentId === 'string') {
    query.parentId = new ObjectId(query.parentId);
  }
  if (query.organization && typeof query.organization === 'string') {
    query.organization = new ObjectId(query.organization);
  }
  if (query.space && typeof query.space === 'string') {
    query.space = new ObjectId(query.space);
  }
  return query;
}
