import mongoose from 'mongoose';
import APIError from '../../errors/api.error';
import { _MSG } from '../messages';
import { UserError } from '../../types/mongoose-types/model-types/user-interface';
import httpStatus from 'http-status';
import logger from '../../config/logger';
import User from '../../models/User';
import Maintainer from '../../models/Maintainer';
import { passwordMatches } from './passwordMatches';

export async function generateTokenByCredentialsEntity({ email, password, entity }: { entity?: string; email?: string; password: string }) {
  try {
    if (!email)
      throw new APIError({
        message: 'An email is required'
      });
    if (!password)
      throw new APIError({
        message: 'Password is required'
      });
    const MongooseModel = mongoose.model(entity);
    // can
    const loggingInstance = await MongooseModel.findOne({ email }).exec();

    if (!loggingInstance.active || !loggingInstance.password) {
      throw new APIError({
        message: _MSG.REGISTER_FIRST
      });
    }
    const err: UserError = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true
    };
    if (loggingInstance && (await loggingInstance.passwordMatches(password))) {
      return {
        loggingInstance,
        accessToken: loggingInstance.token()
      };
    }
    err.message = 'Incorrect email or password';

    throw new APIError(err);
  } catch (error) {
    logger.error(error.message, error);
    throw new Error(_MSG.INVALID_CREDENTIALS);
  }
}
// authenticate user and maintainer at once
export async function authLoginInstances({ email, password }: { email?: string; password?: string }) {
  try {
    if (!email)
      throw new APIError({
        message: 'An email is required to generate a token'
      });
    if (!password) {
      throw new APIError({
        message: 'Password is required'
      });
    }
    // can
    const foundUser = await User.findOne({ email }).exec();
    const foundMaintainer = await Maintainer.findOne({ email }).exec();

    const registeredUser = foundUser && foundUser.active && foundUser.password;
    const registeredMaintainer = foundMaintainer && foundMaintainer.active && foundMaintainer.password;

    if (!registeredUser && !registeredMaintainer) {
      throw new APIError({
        message: _MSG.REGISTER_FIRST
      });
    }
    let result: { user?: typeof foundUser; maintainer?: typeof foundMaintainer } = {};
    result = foundUser && passwordMatches({ password, loginInstance: foundUser }) ? { user: foundUser } : result;
    result = foundMaintainer && passwordMatches({ password, loginInstance: foundMaintainer }) ? { ...result, maintainer: foundMaintainer } : result;
    if (!('user' in result) && !('maintainer' in result)) {
      throw new APIError({
        message: 'Incorrect email or password'
      });
    }
    return result;
  } catch (error) {
    logger.error(error.message, error);
    throw new Error(_MSG.INVALID_CREDENTIALS);
  }
}
