import { USER_ROLES } from './../types/enum/enum';
import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import moment from 'moment-timezone';
import jwt from 'jsonwebtoken';
import APIError from '../errors/api.error';
import vars from '../config/vars';
import autopopulate from 'mongoose-autopopulate';
import logger from '../config/logger';
import Space from './Space';
import Organization from './Organization';
import { ISpace } from '../types/mongoose-types/model-types/space-interface';
import { IUser, LeanUser, UserError, UserModel } from '../types/mongoose-types/model-types/user-interface';
import { _MSG } from '../utils/messages';
import { JwtReturnType } from '../config/resolveJwt';

export type modules = {
  [key: string]: boolean;
  transports: boolean;
  employees: boolean;
  apartments: boolean;
  worksites: boolean;
};

const { jwtSecret /* , jwtExpirationInterval  */ } = vars;

export const userSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      required: true
    },
    surname: {
      type: String,
      required: false,
      default: ''
    },
    avatar: {
      type: Schema.Types.ObjectId,
      ref: 'uploads',
      autopopulate: true
    },
    cover: {
      type: Schema.Types.ObjectId,
      ref: 'uploads',
      autopopulate: true
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'user',
      required: true
    },
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      // unique: true,
      required: false,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: false
    },
    phone: {
      type: String
      // required: false
    },
    active: {
      type: Boolean,
      default: false
    },
    rootSpaces: [
      {
        type: Schema.Types.ObjectId,
        ref: 'spaces',
        required: true
        // autopopulate: true
      }
    ],
    organizations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'organizations'
        // required: true
      }
    ]
    // organization: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'organizations'
    //   // required: true
    // }
    // authToken: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'authTokens'
    // }
  },
  {
    versionKey: false,
    timestamps: true,
    statics: {},
    methods: {}
  }
);

// HASH PASSWORD BEFORE CREATION OF USER
userSchema.pre('save', async function save(next) {
  try {
    if (this.isModified('email') && this.email) {
      this.email = this.email.toLowerCase().trim();
    }
    if (this.isModified('password')) {
      const rounds = 10;
      const hash = await bcrypt.hash(this.password, rounds);
      this.password = hash;
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
type TransformedT = {
  [key: string]: string | Date | undefined;
};
userSchema.method({
  // metto solo i campi che mi servono(evito di mandare tutti i campi)
  transform() {
    const transformed: TransformedT = {};
    const fields = ['id', 'name', 'email', 'role', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  token() {
    const payload = {
      email: this.email,
      organizationId: this.organizations[0]?._id.toString()
    };
    return jwt.sign(payload, jwtSecret, {
      expiresIn: '24h' // expires in 24 hours
    });
  },
  async passwordMatches(password: string) {
    return await bcrypt.compare(password, this.password);
  },
  async getOrganizations() {
    try {
      // const query = this.role === 'super_admin' ? {} : { _id: { $in: this.rootSpaces } };
      const spaces: ISpace[] = await Space.find({ _id: { $in: this.rootSpaces } }).lean();
      return spaces.map((space) => space.organization);
    } catch (error) {
      logger.error(error.message, error);
      throw new Error('User.ts: UserSchema getOrganizations error');
    }
  },
  isSuperAdmin() {
    return this.role === 'super_admin';
  },
  async hasOrganization(organizationId: string): Promise<boolean> {
    if (this.isSuperAdmin()) {
      return true;
    }
    const usersOrganizations = await this.getOrganizations();
    return usersOrganizations.includes(organizationId);
  },
  async isAdminOrganization(organizationId: string): Promise<boolean> {
    if (this.role === 'super_admin') return true;
    const organization = await Organization.findOne({ _id: organizationId, admins: { $in: this._id } }).lean();
    return !!organization;
  }
});

userSchema.statics = {
  // roles: USER_ROLES_ENUM,
  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken(options) {
    try {
      const { email, password, refreshObject } = options;
      if (!email)
        throw new APIError({
          message: 'An email is required to generate a token'
        });

      const user = await this.findOne({ email }).exec();
      if (!user.active || !user.password) {
        throw new APIError({
          message: _MSG.REGISTER_FIRST
        });
      }
      const err: UserError = {
        status: httpStatus.UNAUTHORIZED,
        isPublic: true
      };
      if (password) {
        if (user && (await user.passwordMatches(password))) {
          return {
            user,
            accessToken: user.token()
          };
        }
        err.message = 'Incorrect email or password';
      } else if (refreshObject && refreshObject.userEmail === email) {
        if (moment(refreshObject.expires).isBefore()) {
          err.message = 'Invalid refresh token.';
        } else {
          return {
            user,
            accessToken: user.token()
          };
        }
      } else {
        err.message = 'Incorrect email or refreshToken';
      }
      throw new APIError(err);
    } catch (error) {
      logger.error(error.message, error);
      throw new Error(_MSG.INVALID_CREDENTIALS);
    }
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateEmail(error) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [
          {
            field: 'email',
            location: 'body',
            messages: ['"email" already exists']
          }
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack
      });
    }
    return error;
  }
};

// https://mongoosejs.com/docs/2.7.x/docs/virtuals.html
userSchema.set('toJSON', {
  virtuals: true
});
userSchema.plugin(autopopulate);

// const UserSchema = mongoose.model('users', userSchema) as unknown;
const User = model<IUser, UserModel>('users', userSchema);
export default User;
// export default UserSchema as UserModel<Model<IUserDocument>>;

export const isSuperAdmin = (user: LeanUser | IUser | JwtReturnType) => user.role === 'super_admin';
