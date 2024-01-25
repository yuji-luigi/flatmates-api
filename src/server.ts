// make bluebird default Promise

// eslint-disable-next-line no-undef
import app from './config/express';
import mongoose from './config/mongoose';
import vars from './config/vars';
import BusinessProfile from './models/BusinessProfile';
import Maintainer from './models/Maintainer';
import Role from './models/Role';
import User from './models/User';

// import { generateRandomStringByLength } from './utils/functions';
// import Maintenance from './models/Maintenance';
// import { makeAllPublic } from './api/helpers/uploadFileHelper';
const { port, env } = vars;

// open mongoose connection
mongoose.connect();

app.listen(port, async () => {
  console.log(`server started on port ${port} (${env})`);
  return;
  const documents = await User.find();

  for (const document of documents) {
    // console.log(document);
    const newRole = new Role();
    if (document.rootSpaces.length) {
      console.log('rootSpaces', document.rootSpaces);
      newRole.inhabitant.hasAccess = true;
      newRole.inhabitant.rootSpaces = document.rootSpaces;
    }
    if (document.organizations.length) {
      console.log('organizations', document.organizations);
      newRole.inhabitant.hasAccess = true;
      newRole.inhabitant.organizations = document.organizations;
    }
    console.log(newRole);
    await newRole.save();
    document.roleNew = newRole._id;
    await document.save();
    // await document.save();
    // // console.log(newUser);
    // console.log(maintainerProfile);
  }
});

/**
 * Exports express
 * @public
 */
export default app;
