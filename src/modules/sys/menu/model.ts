export class Menu {
  id = '';
  code = '';
  name = '';
  path = '';
  sort = 0;
  useFontIcon = false;
  fontIcon = '';
  iconData = '';
  disabled = false;
  updatedBy = '';
  updatedDate = '';
  insertDepIds = [];
  deleteDepIds = [];
}

export class RoleMenu {
  menuId = '';
  menuName = '';
  path = '';
  fontIcon = '';
  useFontIcon = false;
  iconData = '';
  departmentId = '';
  departmentName = '';
}

export class HistoryMenu {
  menuPath = '';
  departmentId = 0;
}
