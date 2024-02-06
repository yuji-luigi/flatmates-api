import Check from '../../models/Check';

export async function sumUpChecksByDate(query: Record<string, any>) {
  return await Check.aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalForDay: { $sum: '$total' },
        data: {
          $push: {
            date: '$createdAt',
            total: '$total',
            entity: '$entity',
            name: '$name'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        total: '$totalForDay',
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        data: 1
      }
    }
  ]);
}

export async function sumUpChecksByMonth(query: Record<string, any>) {
  // const from = new Date(query.from);
  // const to = new Date(query.to);
  // set from 2022 and to 2024
  // const from = new Date(2022, 0, 1);
  // const to = new Date(2023, 0, 1);
  // query.createdAt = { $gte: from, $lte: to };

  const result = await Check.aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        total: { $sum: '$total' },
        nChecks: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        total: {
          $divide: [{ $round: [{ $multiply: ['$total', 100] }] }, 100]
        },
        nChecks: 1,
        month: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: 1
          }
        }
      }
    },
    {
      $sort: {
        month: 1
      }
    }
  ]);
  return result;
}

// createRandomChecks({
//   spaceId: '64f41a1e80a79e37c5d6dfe1', //contardo ferrini
//   organizationId: '64f41a1e80a79e37c5d6dfe0',
//   numberOfChecks: 500,
//   fileId: '653c2a6018de0828ae0695e6'
// });
