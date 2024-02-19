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
import UserSpaceConjunction from '../../models/UserSpaceConjunction';

import vars from '../../utils/globalVariables';
import Role from '../../models/Role';
import { RoleInterface } from '../../types/mongoose-types/model-types/role-interface';
import { initCacheRole } from './mongoose-cache/role-cache';

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
UserSpaceConjunction;
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
    initCacheRole();
  },
  close: () => mongoose.connection.close()
};

export default mongooseConnector;
