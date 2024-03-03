import { ObjectId } from 'mongodb';
import Space from '../../models/Space';
import logger from '../../lib/logger';
import { _MSG } from '../../utils/messages';
import { CurrentSpace, ISpace } from '../../types/mongoose-types/model-types/space-interface';
import { ReqUser } from '../../lib/jwt/jwtTypings';
import { accessPermissionsCache } from '../../lib/mongoose/mongoose-cache/access-permission-cache';

/**  searches only root spaces of user */
export function userHasSpace(user: ReqUser, currentSpaceId: string | ObjectId): boolean {
  currentSpaceId = currentSpaceId.toString();
  const spaces = accessPermissionsCache.get(user._id.toString()).map((actrl) => actrl.space.toString());
  return spaces.includes(currentSpaceId);
}
/**  depth-first search (DFS) */
export async function userHasSpaceDFS(user: ReqUser, selectedSpace: ISpace): Promise<boolean> {
  // return user.spaces.includes(selectedSpace._id.toString());
  const spaces = user.accessPermissions.map((actrl) => actrl.space.toString());

  const hasSpaceAsRootSpace = spaces.some((space) => space.toString() === selectedSpace._id.toString());
  if (hasSpaceAsRootSpace) {
    return hasSpaceAsRootSpace;
  }

  // need to search in all
  for (const space of spaces) {
    // const descendants = await aggregateDescendantIds(space, user);
    const hasSpaceAsDescendant = await searchDescendants(space, selectedSpace._id.toString(), user);
    if (hasSpaceAsDescendant) {
      return true;
    }
  }

  return false;
}

async function searchDescendants(spaceId: string, targetId: string, user: ReqUser): Promise<boolean> {
  const descendants = await aggregateDescendantIds(spaceId, user);
  const hasSpaceAsDescendant = descendants.some((descendant) => descendant.toString() === targetId);
  if (hasSpaceAsDescendant) {
    return true;
  }
  for (const descendant of descendants) {
    const hasSpaceAsDescendantOfDescendant = await searchDescendants(descendant.toString(), targetId, user);
    if (hasSpaceAsDescendantOfDescendant) {
      return true;
    }
  }
  return false;
}
/** breadth-first search */
export async function userHasSpaceBFS(user: ReqUser, selectedSpace: ISpace): Promise<boolean> {
  const spaces = user.accessPermissions.map((actrl) => actrl.space.toString());

  // Initialize a queue with the root spaces
  const queue = [...spaces];

  while (queue.length > 0) {
    const currentSpaceId = queue.shift();

    // Check if the current space is the selected space
    if (currentSpaceId === selectedSpace._id.toString()) {
      return true;
    }

    // Get the descendants of the current space and add them to the queue
    const descendants = await aggregateDescendantIds(currentSpaceId, user);
    queue.push(...descendants.map((descendant) => descendant.toString()));
  }

  return false;
}

export async function aggregateDescendantIds(spaceId: string, user: ReqUser): Promise<string[]> {
  try {
    const space = await Space.findById(spaceId);
    if (!user.isSuperAdmin && !(await userHasSpaceBFS(user, space))) {
      throw new Error(_MSG.NOT_ALLOWED);
    }
    // todo: can
    const selectedId = new ObjectId(spaceId);

    const pipeline = [
      // Find all documents with parentId equal to the selected space ID
      { $match: { parentId: selectedId } },
      // Create a new field to store the selected space ID as an array
      { $set: { descendantIds: [selectedId] } },
      // Recursively search for all descendants
      {
        $graphLookup: {
          from: 'spaces',
          startWith: '$descendantIds',
          connectFromField: '_id',
          connectToField: 'parentId',
          as: 'descendants'
        }
      },
      // Unwind the descendants array
      { $unwind: '$descendants' },
      // Group the documents by parentId and create an array of unique descendantIds for each group
      {
        $group: {
          _id: '$descendants.parentId',
          // descendantIds: { $addToSet: '$descendants' }
          descendantIds: { $addToSet: '$descendants._id' }
          // descendantIds: { $addToSet: { $concatArrays: [[selectedId], '$descendants._id'] } }
        }
      },
      // Unwind the descendantIds array
      { $unwind: '$descendantIds' },
      // Group all the descendantIds into a single array
      { $group: { _id: null, descendantIds: { $addToSet: '$descendantIds' } } },
      // Project to remove the _id field and return only the descendantIds array
      { $project: { _id: 0, descendantIds: 1 } }
    ];

    const result = await Space.aggregate(pipeline).exec();

    const spaceIds = result[0]?.descendantIds || [];
    spaceIds.push(selectedId);
    // const spaceIds = result.map((space) => space._id);
    // const spaceIds = result.flatMap((space) => space.descendantIds.toString().split(','));

    return spaceIds;
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
}

export async function aggregateHeadToTail(spaceId: string, user: ReqUser): Promise<string[]> {
  try {
    const space = await Space.findById(spaceId);
    if (!user.isSuperAdmin || !(await userHasSpaceBFS(user, space))) {
      throw new Error(_MSG.NOT_ALLOWED);
    }
    return [];
    // return spaceIds;
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
}

export async function setUrlToSpaceImages(space: ISpace) {
  try {
    await space.cover?.setUrl();
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
}

export function formatCurrentSpace(space: ISpace): CurrentSpace {
  return {
    _id: space._id,
    name: space.name,
    address: space.address,
    slug: space.slug
  };
}

export function formatCurrentSpaceToJSON(space: ISpace): string {
  const currentSpace = {
    _id: space._id,
    name: space.name,
    address: space.address,
    slug: space.slug
  };
  return JSON.stringify(currentSpace);
}

// export async function buildHierarchy({ spaces, space }: { spaces: ISpace[]; rootSpaceId: string }) {
//   // Fetch all spaces from the DB

//   function findChildren(parentId: ObjectId) {
//     return spaces.filter((space) => space.parentId.toString() === parentId.toString());
//   }

// async  function constructSpaceTree(currentSpace: ISpace): any {
//     const children = findChildren(currentSpace._id);
//     if (children.length > 0) {
//       currentSpace.children = children.map((child) => constructSpaceTree(child));
//     }
//     const space = await Space.findById(rootSpaceId);
//     return constructSpaceTree(space);
//   }
// }
