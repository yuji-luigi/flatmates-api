import { describe } from 'node:test';
import mongoose from '../../../config/mongoose';
import { createOptionsForMaintenance } from '../../../api/helpers/maintenanceHelper';
import { IMaintenance } from '../../../types/mongoose-types/model-types/maintenance-interface';
import Space from '../../../models/Space';
import Maintainer from '../../../models/Maintainer';
import 'jest';
import { ISpace } from '../../../types/mongoose-types/model-types/space-interface';
import { MaintainerInterface } from '../../../types/mongoose-types/model-types/maintainer-interface';
import Maintenance from '../../../models/Maintenance';

describe('test for createMailOptionsForMaintenance', () => {
  let options;
  let mainSpace = {} as ISpace;
  let maintainer = {} as MaintainerInterface;
  let maintenance = {} as IMaintenance;
  beforeAll(async () => {
    mongoose.connect();
    mainSpace = await Space.findOne({ isMain: true });
    maintainer = await Maintainer.findOne();
    maintenance = await Maintenance.findOne();
    // maintenance = {
    //   title: 'JEST MAINTENANCE TITLE',
    //   createdAt: new Date().toDateString(),
    //   images: [],
    //   // listViewType: 'default',
    //   // articleType: 'default',
    //   attachments: [],
    //   isImportant: true,
    //   status: 'published',
    //   createdBy: {
    //     name: 'JEST',
    //     surname: 'JEST',
    //     email: 'ojoj@kk.com'
    //   } as IUser,
    //   type: 'Electrician',
    //   mainSpace,
    //   slug: 'JEST-MAINTENANCE-TITLE',
    //   maintainer,
    //   isPublic: false,
    //   _id: '',
    //   updatedAt: '',
    //   linkId: replaceSpecialChars(generateRandomStringByLength(20)),
    //   nonce: 939399,

    // };
  });
  it('create mainl options for maintenance', async () => {
    options = await createOptionsForMaintenance({ maintenance });
    expect(options).toHaveProperty('from');
    expect(options).toHaveProperty('to');
    expect(options).toHaveProperty('subject');
    expect(options).toHaveProperty('html');
    if (options !== false) {
      expect(options.to).toBe(maintenance.maintainer.email);
      expect(options.subject).toBe(`Maintenance assigned. ${maintenance.space.name}: ${maintenance.title}`);
    }
  });

  afterAll(() => {
    mongoose.close();
  });
  return;
});
