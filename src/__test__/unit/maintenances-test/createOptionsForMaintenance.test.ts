import { describe } from 'node:test';
import mongoose from '../../../config/mongoose';
import { createOptionsForMaintenance } from '../../../api/helpers/maintenanceHelper';
import { IMaintenance } from '../../../types/mongoose-types/model-types/maintenance-interface';
import Space from '../../../models/Space';
import UserSchema from '../../../models/User';
import Maintainer from '../../../models/Maintainer';
import 'jest';

describe('test for createMailOptionsForMaintenance', () => {
  let user, options;
  let mainSpace = {} as ISpace;
  let maintainer = {} as MaintainerInterface;
  let maintenance = {} as IMaintenance;
  beforeAll(async () => {
    mongoose.connect();
    mainSpace = await Space.findOne({ isMain: true });
    user = await UserSchema.findOne();
    maintainer = await Maintainer.findOne();
    maintenance = {
      title: 'JEST MAINTENANCE TITLE',
      createdAt: new Date().toDateString(),
      images: [],
      listViewType: 'default',
      articleType: 'default',
      attachments: [],
      isImportant: true,
      status: 'incomplete',
      createdBy: user,
      type: 'Electrician',
      mainSpace,
      slug: 'JEST-MAINTENANCE-TITLE',
      maintainer,
      isPublic: false,
      _id: '',
      updatedAt: ''
    };
  });
  it('create mainl options for maintenance', async () => {
    options = await createOptionsForMaintenance({ maintenance });
    expect(options).toHaveProperty('from');
    expect(options).toHaveProperty('to');
    expect(options).toHaveProperty('subject');
    expect(options).toHaveProperty('html');
    expect(options.to).toBe(maintainer.email);
    expect(options.subject).toBe(`Maintenance assigned. ${mainSpace.name}: ${maintenance.title}`);
  });

  afterAll(() => {
    mongoose.close();
  });
  return;
});
