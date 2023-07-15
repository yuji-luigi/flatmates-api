import { describe } from 'node:test';
import mongoose from '../../../config/mongoose';
import { createOptionsForMaintenance } from '../../../api/helpers/maintenanceHelper';
import { IMaintenance } from '../../../types/mongoose-types/model-types/maintenance-interface';

import 'jest';

describe('test for creating body/html for email', () => {
  let maintenance = {} as IMaintenance;
  beforeAll(async () => {
    mongoose.connect();

    maintenance = Maintena;
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
