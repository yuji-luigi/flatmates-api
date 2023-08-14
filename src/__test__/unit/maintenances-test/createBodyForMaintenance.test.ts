import { describe } from 'node:test';
import mongoose from '../../../config/mongoose';
import { createOptionsForMaintenance } from '../../../api/helpers/maintenanceHelper';
import { IMaintenance } from '../../../types/mongoose-types/model-types/maintenance-interface';

import 'jest';
import Maintenance from '../../../models/Maintenance';

describe('test for creating body/html for email', () => {
  let maintenance = {} as IMaintenance;
  let options;
  beforeAll(async () => {
    mongoose.connect();

    maintenance = await Maintenance.findOne();
  });
  it('create email options for maintenance', async () => {
    options = await createOptionsForMaintenance({ maintenance });
    expect(options).toHaveProperty('from');
    expect(options).toHaveProperty('to');
    expect(options).toHaveProperty('subject');
    expect(options).toHaveProperty('html');
    expect(options.to).toBe(maintenance.maintainer.email);
    expect(options.subject).toBe(`Maintenance assigned. ${maintenance.space.name}: ${maintenance.title}`);
  });

  afterAll(() => {
    mongoose.close();
  });
  return;
});
