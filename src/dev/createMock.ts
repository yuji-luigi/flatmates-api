// import mongoose from 'mongoose';
// import Check from '../models/Check';

// export async function createRandomChecks({
//   numberOfChecks = 10,
//   spaceId,
//   organizationId,
//   fileId
// }: {
//   numberOfChecks: number;
//   spaceId: mongoose.Types.ObjectId | string;
//   organizationId: mongoose.Types.ObjectId | string;
//   fileId: mongoose.Types.ObjectId | string;
// }) {
//   const checks = [];

//   // Constants for generating random values
//   const MIN_TOTAL = 100; // You can change this
//   const MAX_TOTAL = 1500; // You can change this
//   const START_DATE = new Date(2020, 0, 1); // You can change this
//   const END_DATE = new Date();

//   for (let i = 0; i < numberOfChecks; i++) {
//     const randomTotal = Math.round((Math.random() * (MAX_TOTAL - MIN_TOTAL) + MIN_TOTAL) * 100) / 100;
//     const randomDate = new Date(START_DATE.getTime() + Math.random() * (END_DATE.getTime() - START_DATE.getTime()));

//     const checkData = {
//       name: getNameRandomly(),
//       total: randomTotal,
//       createdAt: randomDate, // Assuming `createdAt` is the field where date needs to be set.
//       entity: 'maintenances',
//       space: spaceId,
//       type: 'receipts',
//       organization: organizationId,
//       files: [fileId] // Since `files` is an array, you can add fileId in an array
//       // Add other necessary fields here...
//     };

//     checks.push(checkData);
//   }

//   return await Check.insertMany(checks);
// }

// const getNameRandomly = () => {
//   return NAMES[Math.floor(Math.random() * NAMES.length)];
// };

// const NAMES: string[] = [
//   'Wall broken repair',
//   'Window broken repair',
//   'Door broken repair',
//   'Wall painting repair',
//   'Window painting repair',
//   'Door painting repair',
//   'Wall cleaning repair'
// ];
