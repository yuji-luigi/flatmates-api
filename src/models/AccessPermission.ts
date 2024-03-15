import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import {
  AccessPermissionInterface,
  AccessControllerModel,
  PermissionInterface,
  permissions,
  AccessPermissionCache
} from '../types/mongoose-types/model-types/access-permission-interface';
import { accessPermissionsCache } from '../lib/mongoose/mongoose-cache/access-permission-cache';
import UserRegistry from './UserRegistry';
import User from './User';
import { ErrorCustom } from '../lib/ErrorCustom';
import httpStatus from 'http-status';
const { Schema } = mongoose;

const permissionSchema = new Schema<PermissionInterface>({
  name: {
    type: String,
    required: true,
    enum: permissions
  },
  allowed: {
    type: Boolean,
    required: true
  }
});

export const accessPermissionSchema = new Schema<AccessPermissionInterface, AccessControllerModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'roles',
      required: true
    },
    space: {
      type: Schema.Types.ObjectId,
      ref: 'spaces',
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },

    permissions: [permissionSchema]
  },
  {
    versionKey: false,
    timestamps: true,
    statics: {
      buildPermissionFields: function (dto) {
        return permissions.map((permission) => {
          return {
            name: permission,
            allowed: dto[permission]
          };
        });
      }
    },
    methods: {
      getCacheKey: function () {
        return `${this.user}-${this.role}-${this.space}`;
      },

      getCachedPermission: function () {
        return accessPermissionsCache.get(this.getCacheKey());
      },
      cachePermission: function () {
        // accessControllerCache.set(this.getCacheKey(), this);
      },
      checkPermissionWithCache: function () {
        const cached = this.getCachedPermission();
        if (cached) {
          return cached;
        }
      }
    }
  }
);

accessPermissionSchema.pre('save', async function (next) {
  if (this.isNew) {
    const existingAP = await AccessPermission.findOne({ user: this.user, role: this.role, space: this.space });
    if (existingAP) {
      throw new ErrorCustom('Permission already exists', httpStatus.BAD_REQUEST);
    }
  }
  const userRegistry = await UserRegistry.findOne({ user: this.user, role: this.role });
  if (userRegistry) {
    return next();
  }
  await UserRegistry.create({ user: this.user, role: this.role });
  return next();
});
accessPermissionSchema.post('save', async function (doc: AccessPermissionCache) {
  const userId = doc.user instanceof User ? doc.user._id.toString() : doc.user.toString();
  const cached = accessPermissionsCache.get(userId);
  if (cached) {
    cached.push(doc);
    accessPermissionsCache.set(userId, cached);
    return;
  }
  const permissions = await AccessPermission.find<AccessPermissionCache>({ user: userId });
  accessPermissionsCache.set(userId, permissions);
});

accessPermissionSchema.plugin(autoPopulate);
const AccessPermission = mongoose.model<AccessPermissionInterface, AccessControllerModel>('accessPermissions', accessPermissionSchema);

export default AccessPermission;
