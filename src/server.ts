// make bluebird default Promise

// eslint-disable-next-line no-undef
import app from './config/express';
import mongoose from './config/mongoose';

import logger from './config/logger';
import vars from './config/vars';
import Maintainer from './models/Maintainer';
const { port, env } = vars;

// open mongoose connection
mongoose.connect();

app.listen(port, async () => {
  logger.info(`server started on port ${port} (${env})`);
  const spaces = await Maintainer.find({});
  for (const s of spaces) {
    await s.save();
  }
});

/**
 * Exports express
 * @public
 */
export default app;
