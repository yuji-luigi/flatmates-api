import mongoose, { Document, Model, ObjectId } from 'mongoose';
import autoPopulate from 'mongoose-autopopulate';
import {
  ACtrlDtoDashboard,
  AccessControllerInterface,
  AccessControllerMethods,
  AccessControllerStatics,
  Permission,
  PermissionInterface,
  permissions
} from '../types/mongoose-types/model-types/access-controller-interface';
import { RoleFields, isRoleField, roles } from '../types/mongoose-types/model-types/role-interface';
import { roleCache } from '../lib/mongoose/mongoose-cache/role-cache';
import { IUser } from '../types/mongoose-types/model-types/user-interface';
import { ReqUser } from '../lib/jwt/jwtTypings';
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
type AccessControllerDocument = Document & AccessControllerInterface;
type AccessControllerModel = Model<AccessControllerDocument, unknown, AccessControllerMethods> & AccessControllerStatics;

export const accessControllerSchema = new Schema<AccessControllerDocument, AccessControllerModel, AccessControllerMethods>(
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
    statics: {
      buildPermissionFields: function (dto) {
        return permissions.map((permission) => {
          return {
            name: permission,
            allowed: dto[permission]
          };
        });
      },

      createOrUpdateFromDashboardDto: async function (dtoFromClient: ACtrlDtoDashboard[], targetUserId: ObjectId, operatingUser: ReqUser) {
        for (const dto of dtoFromClient) {
          // todo can create acCtrl check logic here
          if (!operatingUser.isSuperAdmin) {
            throw new Error('You are not allowed to create access controller');
          }
          const role = roleCache.get(dto.roleName);

          const accessController =
            (await this.findOne({
              user: targetUserId,
              role,
              rootSpace: dto.rootSpace
            })) || new this();
          const permissions = this.buildPermissionFields(dto);
          accessController.set({
            ...dto,
            user: targetUserId,
            permissions,
            role
          });
          await accessController.save();
        }
      }
    },
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

accessControllerSchema.plugin(autoPopulate);
export default mongoose.model<AccessControllerDocument, AccessControllerModel>('accessControllers', accessControllerSchema);
