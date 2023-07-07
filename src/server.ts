// make bluebird default Promise

// eslint-disable-next-line no-undef
import app from './config/express';
import mongoose from './config/mongoose';

import logger from './config/logger';
import vars from './config/vars';
// import { makeAllPublic } from './api/helpers/uploadFileHelper';
const { port, env } = vars;

// open mongoose connection
mongoose.connect();

app.listen(port, async () => {
  logger.info(`server started on port ${port} (${env})`);
  // await makeAllPublic();
  // const uploads = await Upload.find();
  // for (const upload of uploads) {
  //   upload.url = vars.storageUrl + '/' + upload.fullPath;
  //   await upload.save();
  // }
});

/**
 * Exports express
 * @public
 */
export default app;
