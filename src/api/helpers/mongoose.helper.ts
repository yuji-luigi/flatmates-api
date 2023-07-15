import mongoose, { Document, SortOrder } from 'mongoose';
import Thread from '../../models/Thread';
import logger from '../../config/logger';
import { ObjectId } from 'mongodb';
import { generateWord, replaceSpecialCharsWith } from '../../utils/functions';
import { MongooseBaseModel } from '../../types/mongoose-types/model-types/base-types/base-model-interface';
import { Entities } from '../../types/mongoose-types/model-types/Entities';
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
  const threads = await Thread.find<MongooseBaseModel>(query).sort({
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

export interface ICollectionAware extends Document {
  constructor: { collection: { name: string } };
}
export type DocumentWithSlug = { slug?: string; name?: string; title: string } & ICollectionAware;

/**
 * @returns string of collection name. using document.constructor.collection.name
 */
export const getCollectionName = <T extends Document>(document: T & DocumentWithSlug) => document.constructor.collection.name;

export async function createSlug<T extends Document>(document: T & DocumentWithSlug): Promise<string> {
  // export async function createSlug(document: Document & { slug?: string; name: string } & MongooseThis): Promise<string> {
  try {
    // case the document already registered a slug. return
    if (document.slug) {
      return document.slug;
    }
    let slug = document.name || document.title;
    if (!slug) {
      throw new Error('slug is not defined. ');
    }

    slug = replaceSpecialCharsWith(slug, '-').toLocaleLowerCase();
    // store the slug to use later
    let slugToCheck = slug;

    const Model = mongoose.model(getCollectionName(document));
    // it can't find itself because it is not saved yet. and existing documents are not already returned
    const count = await Model.count({ slug });
    let isUnique = !!count;
    while (!isUnique) {
      const word = generateWord();
      slugToCheck = `${slug}-${word}`;
      const foundOtherBySlug = await Model.findOne({ slug: slugToCheck, _id: { $ne: document._id } });
      isUnique = !foundOtherBySlug;
      // slug = slugToCheck;
    }
    return slugToCheck;
  } catch (error) {
    logger.error(error.message || error);
    throw new Error('error in slug generation of space');
  }
}
