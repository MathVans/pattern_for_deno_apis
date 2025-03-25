import { addressTable, AddressRelations } from './address.ts';
import { userTable, userRelations } from './user.ts';
import { roleTable, roleRelations } from './role.ts';

// Group tables together
export const tables = {
  addresses: addressTable,
  users: userTable,
  roles: roleTable,
  AddressRelations,
  userRelations,
  roleRelations,
};



