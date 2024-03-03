import mongoose from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import {
  AccessControllerInterface,
  AccessControllerModel,
  PermissionInterface,
  permissions
} from '../types/mongoose-types/model-types/access-controller-interface';
import { accessControllersCache } from '../lib/mongoose/mongoose-cache/access-controller-cache';
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

export const accessPermisionSchema = new Schema<AccessControllerInterface, AccessControllerModel>(
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
        return accessControllersCache.get(this.getCacheKey());
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

// accessPermisionSchema.pre('find', function () {
//   this.populate('role');
// });
// accessPermisionSchema.pre('findOne', function () {
//   this.populate('role');
// });
accessPermisionSchema.plugin(autoPopulate);
export default mongoose.model<AccessControllerInterface, AccessControllerModel>('accessPermissions', accessPermisionSchema);
