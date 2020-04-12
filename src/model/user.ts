export class User {
  id = '';
  lastName = '';
  firstName = '';
  username = '';
  fontIcon = '';
  useFontIcon = false;
  iconData = '';
  email = '';
  password = '';
  activated = true;

  insertDepartmentIds = [];
  removeDepartmentIds = [];
  defaultOwnerOrgId: string = undefined;

  // transient column
  name = '';
}
