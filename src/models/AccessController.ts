import mongoose, { Document, Model } from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import {
  AccessControllerInterface,
  AccessControllerMethods,
  PermissionInterface,
  permissions
} from '../types/mongoose-types/model-types/access-controller-interface';

const { Schema } = mongoose;

export const accessControllerCache = new Map<string, boolean>();

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
type AccessControllerModel = Model<AccessControllerInterface, unknown, AccessControllerMethods>;
type AccessControllerDocument = Document & AccessControllerInterface;

export const accessControllerSchema = new Schema<AccessControllerInterface, AccessControllerModel, AccessControllerMethods>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    role: {
      type: Schema.Types.ObjectId,
      required: true
    },
    rootSpace: {
      type: Schema.Types.ObjectId,
      ref: 'spaces',
      required: true
    },
    permissions: [permissionSchema]
  },
  {
    versionKey: false,
    timestamps: true,
    methods: {
      getCacheKey: function (this: AccessControllerDocument) {
        return `${this.user}-${this.role}-${this.rootSpace}`;
      },
      getCachedPermission: function (this: AccessControllerDocument) {
        return accessControllerCache.get(this.getCacheKey());
      },
      cachePermission: function (this: AccessControllerDocument) {
        // accessControllerCache.set(this.getCacheKey(), this);
      },
      checkPermissionWithCache: function (this: AccessControllerDocument) {
        const cached = this.getCachedPermission();
        if (cached) {
          return cached;
        }
        // const hasPermission = this.permissions.some((permission) => permission.allowed);
      }
    }
  }
);

accessControllerSchema.statics = {};
accessControllerSchema.plugin(autoPopulate);
export default mongoose.model('accessControllers', accessControllerSchema);
