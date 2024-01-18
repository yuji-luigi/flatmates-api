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
});

/**
 * Exports express
 * @public
 */
export default app;
