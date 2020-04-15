import { TableColumn } from '@/model/base';
import { T } from '@/assets/js/locale/locale';
import { SObject } from '@/assets/js/sobject';
import { SJSON } from '@/assets/js/sjson';
import { Observable } from 'rxjs';

export const userColumns: TableColumn[] = [
  { name: 'lastName', title: T('COMMON.LABEL.LAST_NAME') },
  { name: 'firstName', title: T('COMMON.LABEL.FIRST_NAME') },
  { name: 'username', title: T('COMMON.LABEL.USERNAME') },
  { name: 'departmentName', title: T('COMMON.LABEL.DEPARTMENT_NAME') },
];
export const roleColumns = [
  { name: 'id', type: 'hidden' },
  { name: 'checked', title: ' ', type: 'checkbox' },
  { name: 'code', title: T('COMMON.LABEL.CODE'), type: 'text' },
  { name: 'name', title: T('COMMON.LABEL.NAME'), type: 'text' },
  { name: 'disabled', title: T('COMMON.LABEL.DISABLED'), type: 'checkbox' },
];

const isAllUsersTheSameRoles = (assignedRoles: any[]) => {
  return [...new Set(assignedRoles.map((it) => SJSON.stringify(it.roleIds)))].length === 1;
};

export const applyAssignedRole = (roles: any[], assignedRoles: any[]) => {
  if (isAllUsersTheSameRoles(assignedRoles)) {
    return roles.map((item) => {
      let filter =
        assignedRoles &&
        assignedRoles.length > 0 &&
        assignedRoles[0].roleIds.filter((roleId: any) => roleId.toString() === item.id.toString());
      if (filter && filter.length > 0) {
        item.checked = true;
        item.disabled = filter[0].disabled;
      } else {
        item.checked = false;
        item.disabled = false;
      }
      return item;
    });
  } else {
    return roles.map((item) => {
      item.checked = false;
      item.disabled = false;
      return item;
    });
  }
};
