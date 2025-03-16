import { addressTable, AddressRelations } from './address.ts';
import { customerTable, customerRelations } from './customer.ts';
import { roleTable, roleRelations } from './role.ts';

// Group tables together
export const tables = {
  addresses: addressTable,
  customers: customerTable,
  roles: roleTable,
  AddressRelations,
  customerRelations,
  roleRelations,
};



