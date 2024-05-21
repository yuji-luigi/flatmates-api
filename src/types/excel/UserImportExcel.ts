import { SpaceExcel } from './SpaceExcel';

export type UserImportExcel = {
  Proprietario: string;
  Inquilino: string;
  Altro: string;
} & SpaceExcel;
