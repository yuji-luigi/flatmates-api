import { ObjectId } from 'mongodb';
// not using not recursive. so only first level children
export const headToTailPipeline = (selectedId: ObjectId) => [
  { $match: { _id: selectedId } }, // Start with the selected space

  // Use $graphLookup for the recursive self-lookup
  {
    $graphLookup: {
      from: 'spaces',
      startWith: '$_id',
      connectFromField: '_id',
      connectToField: 'parentId',
      as: 'children',
      depthField: 'depth',
      maxDepth: 100 // This can be set to some reasonable maximum depth you expect
    }
  },

  // Sort children by depth
  {
    $unwind: '$children'
  },
  {
    $sort: { 'children.depth': 1 }
  },

  // This step will rebuild the tree structure from the sorted list
  {
    $group: {
      _id: '$_id',
      root: { $first: '$$ROOT' },
      children: { $push: '$children' }
    }
  },

  // Now we can set the processed children to the root
  {
    $addFields: {
      'root.children': '$children'
    }
  },
  {
    $replaceRoot: { newRoot: '$root' }
  }
];
// not using getSpaceHierarchy but children are all the descendants
export const a = (spaceId: ObjectId) => [
  { $match: { _id: spaceId } }, // Start with the selected space

  // Use $graphLookup to recursively find child spaces
  {
    $graphLookup: {
      from: 'spaces',
      startWith: '$_id',
      connectFromField: '_id',
      connectToField: 'parentId',
      as: 'children'
    }
  },

  // This is to ensure that children are nested. Use another $graphLookup to get the next level of children.
  {
    $unwind: '$children'
  },
  {
    $graphLookup: {
      from: 'spaces',
      startWith: '$children._id',
      connectFromField: '_id',
      connectToField: 'parentId',
      as: 'children.children'
    }
  },

  // Group back to organize the hierarchy structure
  {
    $group: {
      _id: '$_id',
      space: { $first: '$$ROOT' },
      children: { $addToSet: '$children' }
    }
  },
  {
    $addFields: {
      'space.children': '$children'
    }
  },
  {
    $replaceRoot: {
      newRoot: '$space'
    }
  }
];
