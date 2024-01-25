/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from 'mongoose';
import logger from './logger';
import Bookmark from '../models/Bookmark';
import Comment from '../models/Comment';
import Fund from '../models/Fund';
import FundRule from '../models/FundRule';
import Proposal from '../models/Proposal';
import Tag from '../models/Tag';
import Thread from '../models/Thread';
import User from '../models/User';
import Wallet from '../models/Wallet';
import Organization from '../models/Organization';
import Notification from '../models/Notification';
import UserSetting from '../models/UserSetting';
import Space from '../models/Space';
import Upload from '../models/Upload';
import Maintenance from '../models/Maintenance';
import Maintainer from '../models/Maintainer';
import Check from '../models/Check';
import SpaceTag from '../models/SpaceTag';
import AuthToken from '../models/AuthToken';
import Role from '../models/Role';
import BusinessProfile from '../models/BusinessProfile';

import vars from './vars';

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
Maintainer;
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

export default {
  connect: () => {
    mongoose
      .connect(vars.mongo.uri)
      .then(() => {
        logger.info('Connected to DB! Uri:' + vars.mongo.uri);
        console.log('Connected to DB! Uri:' + vars.mongo.uri);
      })
      .catch((err: object | string) => logger.error(`ERROR CONNECTING TO MONGO\n${err}. mongoURI: ${vars.mongo.uri}`));
  },
  close: () => mongoose.connection.close()
};
logger.debug('goawirhgaph');
export {};
