import mongoose from 'mongoose';
/* eslint-disable @typescript-eslint/no-unused-vars */
import logger from '../logger';
import Bookmark from '../../models/Bookmark';
import Comment from '../../models/Comment';
import Fund from '../../models/Fund';
import FundRule from '../../models/FundRule';
import Proposal from '../../models/Proposal';
import Tag from '../../models/Tag';
import Thread from '../../models/Thread';
import User from '../../models/User';
import Wallet from '../../models/Wallet';
import Organization from '../../models/Organization';
import Notification from '../../models/Notification';
import UserSetting from '../../models/UserSetting';
import Space from '../../models/Space';
import Upload from '../../models/Upload';
import Maintenance from '../../models/Maintenance';
import Check from '../../models/Check';
import SpaceTag from '../../models/SpaceTag';
import AuthToken from '../../models/AuthToken';
import BusinessProfile from '../../models/BusinessProfile';

import vars from '../../utils/globalVariables';
import Role from '../../models/Role';
import { RoleInterface } from '../../types/mongoose-types/model-types/role-interface';
import { initCacheRole } from './mongoose-cache/role-cache';
import { initSeed, seedRoles } from './seed/mongoose-seeder';
import { initCache } from './mongoose-cache';
import AccessPermission from '../../models/AccessPermission';
import UserRegistry from '../../models/UserRegistry';
import { ICollectionAware, createSlug } from '../../api/helpers/mongoose.helper';
import { IUser } from '../../types/mongoose-types/model-types/user-interface';

// Set mongoose Promise to Bluebird
// eslint-disable-next-line no-undef
mongoose.Promise = Promise;

mongoose.set('strictQuery', false);

Bookmark;
Comment;
Fund;
FundRule;
Proposal;
Comment;
Tag;
Thread;
User;
Wallet;
Organization;
Notification;
UserSetting;
Space;
SpaceTag;
Upload;
Maintenance;
Check;
AuthToken;
BusinessProfile;
Role;
// Exit Applicatioin on Error
mongoose.connection.on('error', (err: object | string) => {
  logger.error(`Mongoose connection error: ${err}`);
  process.exit(-1);
});

// Print mongoose logs in dev env
if (process.env.NODE_ENV === 'dev') {
  // mongoose.set('debug', true)
}

const mongooseConnector = {
  init: async () => {
    await mongoose
      .connect(vars.mongo.uri)
      .catch((err: object | string) => logger.error(`ERROR CONNECTING TO MONGO\n${err}. mongoURI: ${vars.mongo.uri}`));
    console.log('Connected to MongoDB');
    await initSeed();
    await initCache();
    await initUserRegistry();
    // await play();
  },
  close: () => mongoose.connection.close()
};

export default mongooseConnector;

async function initUserRegistry() {
  const documentsToInsert = await AccessPermission.find();

  const operations = await Promise.all(
    documentsToInsert.map(async (doc) => {
      const foundSame = await UserRegistry.findOne({ user: doc.user, role: doc.role });
      if (doc.user instanceof mongoose.Types.ObjectId && doc.role instanceof mongoose.Types.ObjectId) {
        if (!foundSame) {
          return {
            insertOne: {
              document: {
                user: doc.user,
                role: doc.role,
                isPublic: false
              }
            }
          };
        }
      }
      // Optionally handle the case where a duplicate is found, such as logging it or pushing it to an array for reporting.
      return null;
    })
  );

  // Filter out any null operations resulting from duplicates
  const filteredOperations = operations.filter((op) => op !== null);

  if (filteredOperations.length > 0) {
    await UserRegistry.bulkWrite(filteredOperations);
  }
}

async function play() {
  try {
    const users = await User.find<IUser & ICollectionAware>();
    for (const user of users) {
      //
      const slug = await createSlug(user);
      console.log(slug);
      user.slug = slug;
      // await user.save();
    }
  } catch (error) {
    logger.error(error.stack);
  }
}
