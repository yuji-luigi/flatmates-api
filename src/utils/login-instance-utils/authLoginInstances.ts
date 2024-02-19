import APIError from '../../errors/api.error';
import { _MSG } from '../messages';
import logger from '../../lib/logger';
import User from '../../models/User';
import { passwordMatches } from './passwordMatches';
import { Maintainer } from '../../api/controllers/MaintainerController';

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

    // check active and password for both instances
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
