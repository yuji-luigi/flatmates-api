// make bluebird default Promise

// eslint-disable-next-line no-undef
import app from './config/express';
import mongoose from './config/mongoose';

import logger from './config/logger';
import vars from './config/vars';
// import { generateRandomStringByLength } from './utils/functions';
// import Maintenance from './models/Maintenance';
// import { makeAllPublic } from './api/helpers/uploadFileHelper';
const { port, env } = vars;

// open mongoose connection
mongoose.connect();

app.listen(port, async () => {
  logger.info(`server started on port ${port} (${env})`);
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
