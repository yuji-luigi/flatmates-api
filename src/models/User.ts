import { USER_ROLES } from './../types/enum/enum';
import { Model, Schema, model } from 'mongoose';
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
import { IOrganization } from '../types/mongoose-types/model-types/organization-interface';
import { ISpace } from '../types/mongoose-types/model-types/space-interface';
import { IUser, UserError } from '../types/mongoose-types/model-types/user-interface';

export type modules = {
  [key: string]: boolean;
  transports: boolean;
  employees: boolean;
  apartments: boolean;
  worksites: boolean;
};

const { jwtSecret /* , jwtExpirationInterval  */ } = vars;

/** UserModel static methods*/

// interface IUserDocument {
//   _id: ObjectId;
//   avatar?: IUpload;
//   name?: string | undefined;
//   surname?: string | undefined;
//   phone?: string | undefined;
//   email?: string | undefined;
//   password: string;
//   /** will be only super_admin and user. will use adminOf field to check if user is admin of an space.
//    */
//   role?: userRoles;
//   adminOf?: ISpace[] | [];
//   bookmarks?: string[]; // consider if populate too much (threads and contents in threads)
//   wallet?: string;
//   userSetting: string | boolean;
//   last_login?: Date;
//   rootSpaces?: ISpace[] | [];
//   // modules?: modules;
//   // organizations: IOrganization[] | [];
//   organization: IOrganization | null | undefined;
//   cover: IUpload;
//   _update?: {
//     password?: Buffer | string;
//   };
//   token(): () => string;
//   hasOrganization: (organizationId: string) => Promise<boolean>;
//   isAdminOrganization: (organizationId: string) => Promise<boolean>;
//   getOrganizations: () => Promise<IOrganization[]>;
//   isSuperAdmin: () => boolean;
//   passwordMatches: (password: string) => boolean;
//   findAndGenerateToken: (body: IUserDocument) => Promise<{
//     user: UserModel;
//     accessToken: string;
//   }>;
//   /*   roles: string[] | any;
//    */
// }

interface UserModel extends Model<IUser> {
  // roles: USER_ROLES_ENUM;
  passwordMatches: (password: string) => boolean;
  findAndGenerateToken: (body: IUser) => Promise<{
    // user: UserModel;
    user: IUser;
    accessToken: string;
  }>;
  hasOrganization: (organizationId: string) => Promise<boolean>;
  token: () => string;
  save: () => void;
  getOrganizations: () => Promise<IOrganization[]>;
  isSuperAdmin: () => boolean;
  isAdminOrganization: (organizationId: string) => Promise<boolean>;
}

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
      enum: USER_ROLES
      // required: true,
    },
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String
      // required: false
    },
    rootSpaces: [
      {
        type: Schema.Types.ObjectId,
        ref: 'spaces',
        required: true
        // autopopulate: true
      }
    ],
    // organizations: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'organizations',
    //     required: true
    //   }
    // ]
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: true,
    statics: {},
    methods: {
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
      async hasOrganization(organizationId): Promise<boolean> {
        if (this.isSuperAdmin()) {
          return true;
        }
        const usersOrganizations = await this.getOrganizations();
        return usersOrganizations.includes(organizationId);
      },
      isSuperAdmin() {
        return this.role === 'super_admin';
      },
      async isAdminOrganization(organizationId): Promise<boolean> {
        if (this.role === 'super_admin') return true;
        const organization = await Organization.findOne({ _id: organizationId, admins: { $in: this._id } }).lean();
        return !!organization;
      }
    }
  }
);

// HASH PASSWORD BEFORE CREATION OF USER
userSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();
    const rounds = 10;
    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

// HASH PASSWORD BEFORE UPDATE OF USER
// TODO: try to figure out how to handle this situation
/* FindOneAndUpdate this is difficult to understand */
/* userSchema.pre('findOneAndUpdate', async function (next) {
  try {
    // if password is not updated
    if (!this._update.password) {
      return next();
    }

    const rounds = 10;

    const hash = await bcrypt.hash(this._update.password, rounds);
    this._update.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
}); */

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
      // id: this._id,
      // name: this.name,
      // surname: this.surname,
      email: this.email
      // role: this.role,
      // description: this.description,
      // avatar: this.avatar,
      // locale: this.locale,
    };
    return jwt.sign(payload, jwtSecret, {
      expiresIn: '24h' // expires in 24 hours
    });
  },
  // async getOrganizations() {
  //   try {
  //     const spaces = await Space.find({ _id: { $in: this.rootSpaces } }).lean();
  //     return spaces.map((space) => space.organization);
  //   } catch (error) {
  //     logger.error(error.message, error);
  //   }
  // },
  async passwordMatches(password: string) {
    return bcrypt.compare(password, this.password);
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
    const { email, password, refreshObject } = options;
    if (!email)
      throw new APIError({
        message: 'An email is required to generate a token'
      });

    const user = await this.findOne<UserModel>({ email }).exec();
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

userSchema.plugin(autopopulate);

// const UserSchema = mongoose.model('users', userSchema) as unknown;
const UserSchema = model<IUser, UserModel>('users', userSchema);
export default UserSchema;
// export default UserSchema as UserModel<Model<IUserDocument>>;
