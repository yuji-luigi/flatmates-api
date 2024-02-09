import { describe } from 'node:test';
import mongoose from '../../../lib/mongoose/mongoose';
import { createOptionsForMaintenance } from '../../../api/helpers/maintenanceHelper';
import { IMaintenance } from '../../../types/mongoose-types/model-types/maintenance-interface';

import 'jest';
import Maintenance from '../../../models/Maintenance';
import { AuthTokenInterface } from '../../../types/mongoose-types/model-types/auth-token-interface';
import AuthToken from '../../../models/AuthToken';

describe('test for creating body/html for email', () => {
  let maintenance = {} as IMaintenance;
  let authToken = {} as AuthTokenInterface;

  let options;
  beforeAll(async () => {
    mongoose.connect();

    maintenance = await Maintenance.findOne();
    authToken = await AuthToken.findOne({
      'docHolder.instanceId': maintenance._id
    });
  });
  it('create email options for maintenance', async () => {
    options = await createOptionsForMaintenance({ maintenance, authToken });
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
