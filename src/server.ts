// make bluebird default Promise

// eslint-disable-next-line no-undef
import app from './config/express';
import mongoose from './config/mongoose';

import vars from './config/vars';
// import { generateRandomStringByLength } from './utils/functions';
// import Maintenance from './models/Maintenance';
// import { makeAllPublic } from './api/helpers/uploadFileHelper';
const { port, env } = vars;

// open mongoose connection
mongoose.connect();

app.listen(port, async () => {
  console.log(`server started on port ${port} (${env})`);
  // const maintenances = await Maintenance.find();
  // const promises = maintenances.map(async (maintenance) => {
  //   const authToken = new AuthToken({
  //     linkId: maintenance.linkId,
  //     nonce: maintenance.nonce,
  //     docHolder: {
  //       ref: 'maintenances',
  //       instanceId: maintenance._id
  //     },
  //     space: maintenance.space
  //   });
  //   maintenance.linkId = undefined;
  //   maintenance.nonce = undefined;
  //   await authToken.save();
  //   await maintenance.save();
  //   console.log(authToken);
  // });
  // const checks = await Check.find().populate('maintenance');
  // await Promise.all(
  //   checks.map(async (check) => {
  //     check.entity = 'maintenances';
  //     // check.total = check.total || 0;
  //     await check.save();
  //   })
  // );
  // const documents = await Mongoose.model('maintenances').find();
  // for (const document of documents) {
  //   document.space = document.mainSpace;
  //   document.mainSpace = undefined;
  //   await document.save();
  // }
});

/**
 * Exports express
 * @public
 */
export default app;
