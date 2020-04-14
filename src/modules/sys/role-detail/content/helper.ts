import { T } from '@/assets/js/locale/locale';

export const nestedHeaders = [
  [
    {
      title: T('SYS.LABEL.COMPANY_BRANCH'),
      colspan: 2,
    },
    {
      title: T('SYS.LABEL.MENU_SCREEN'),
      colspan: 5,
    },
    {
      title: T('SYS.LABEL.ROLE_CONTROL'),
      colspan: 5,
    },
  ],
];

export const columns = [
  {
    type: 'hidden',
    name: 'branchId',
  },
  {
    type: 'text',
    name: 'branchName',
    title: T('COMMON.LABEL.BRANCH'),
    width: 150,
    readOnly: true,
  },
  {
    type: 'hidden',
    name: 'departmentId',
  },
  {
    type: 'text',
    name: 'departmentName',
    title: T('COMMON.LABEL.DEPARTMENT'),
    width: 150,
    readOnly: true,
  },
  {
    type: 'checkbox',
    title: '[x]',
    name: 'checked',
    width: 40,
  },
  {
    type: 'hidden',
    name: 'menuId',
  },
  {
    type: 'text',
    name: 'menuName',
    title: T('COMMON.LABEL.MENU'),
    width: 150,
    readOnly: true,
  },
  {
    type: 'checkbox',
    name: 'isPrivate',
    title: T('SYS.LABEL.PRIVATE'),
    width: 70,
  },
  {
    type: 'dropdown',
    title: T('SYS.LABEL.DATA_LEVEL'),
    name: 'dataLevel',
    width: 120,
    source: [
      { id: 0, name: 'Default' },
      { id: 10, name: 'Group' },
      { id: 100, name: 'Department' },
      { id: 1000, name: 'Branch' },
      { id: 10000, name: 'Company' },
    ],
  },
  {
    type: 'checkbox',
    name: 'approve',
    title: T('SYS.LABEL.APPROVE'),
    width: 70,
  },
  {
    type: 'hidden',
    name: 'controlId',
  },
  {
    type: 'text',
    name: 'controlName',
    title: T('COMMON.LABEL.CONTROL'),
    width: 150,
    readOnly: true,
  },
  {
    type: 'checkbox',
    name: 'renderControl',
    title: T('SYS.LABEL.RENDER'),
    width: 70,
  },

  {
    type: 'checkbox',
    name: 'disableControl',
    title: T('SYS.LABEL.DISABLED'),
    width: 70,
  },
  {
    type: 'checkbox',
    name: 'confirm',
    title: T('SYS.LABEL.CONFIRM'),
    width: 70,
  },
  {
    type: 'checkbox',
    name: 'requirePassword',
    title: T('SYS.LABEL.REQUIRE_PASSWORD'),
    width: 70,
  },
];

export const makeMergeCells = (data: any) => {
  let branchStartIndex = 0;
  let branchEndIndex = 0;
  let prevBranchId: any = null;
  let branchMerges = {};

  let departmentStartIndex = 0;
  let departmentEndIndex = 0;
  let prevDepartmentId: any = null;
  let departmentMerges = {};

  let menuStartIndex = 0;
  let menuEndIndex = 0;
  let prevMenuId: any = null;
  let menuMerges = {};

  for (let i = 0; i < data.length; i++) {
    // branch
    if (prevBranchId === null) {
      prevBranchId = data[i].branchId;
    }
    if (i < data.length - 1 && prevBranchId.toString() !== data[i].branchId.toString()) {
      branchEndIndex = i;
      let rowsSpan = branchEndIndex - branchStartIndex;

      Object.assign(branchMerges, { ['B' + (branchStartIndex + 1)]: [1, rowsSpan] });
      branchStartIndex = i;
      prevBranchId = data[i].branchId;
    } else if (i === data.length - 1) {
      branchEndIndex = i;
      let rowsSpan: number;
      if (prevBranchId.toString() !== data[i].branchId.toString()) {
        rowsSpan = branchEndIndex - branchStartIndex;
      } else {
        rowsSpan = branchEndIndex - branchStartIndex + 1;
      }
      Object.assign(branchMerges, { ['B' + (branchStartIndex + 1)]: [1, rowsSpan] });
    }

    // department
    if (prevDepartmentId === null) {
      prevDepartmentId = data[i].departmentId;
    }
    if (i < data.length - 1 && prevDepartmentId.toString() !== data[i].departmentId.toString()) {
      departmentEndIndex = i;
      let rowsSpan = departmentEndIndex - departmentStartIndex;
      if (rowsSpan > 1) {
        Object.assign(departmentMerges, { ['D' + (departmentStartIndex + 1)]: [1, rowsSpan] });
      }
      departmentStartIndex = i;
      prevDepartmentId = data[i].departmentId;
    } else if (i === data.length - 1) {
      departmentEndIndex = i;
      let rowsSpan: number;
      if (prevDepartmentId.toString() !== data[i].departmentId.toString()) {
        rowsSpan = departmentEndIndex - departmentStartIndex;
      } else {
        rowsSpan = departmentEndIndex - departmentStartIndex + 1;
      }
      if (rowsSpan > 1) {
        Object.assign(departmentMerges, { ['D' + (departmentStartIndex + 1)]: [1, rowsSpan] });
      }
    }

    // menu
    if (prevMenuId === null) {
      prevMenuId = data[i].menuId;
    }
    if (i < data.length - 1 && prevMenuId.toString() !== data[i].menuId.toString()) {
      menuEndIndex = i;
      let rowsSpan = menuEndIndex - menuStartIndex;
      if (rowsSpan > 1) {
        Object.assign(menuMerges, { ['E' + (menuStartIndex + 1)]: [1, rowsSpan] });
        Object.assign(menuMerges, { ['G' + (menuStartIndex + 1)]: [1, rowsSpan] });
        Object.assign(menuMerges, { ['H' + (menuStartIndex + 1)]: [1, rowsSpan] });
        Object.assign(menuMerges, { ['I' + (menuStartIndex + 1)]: [1, rowsSpan] });
        Object.assign(menuMerges, { ['J' + (menuStartIndex + 1)]: [1, rowsSpan] });
      }
      menuStartIndex = i;
      prevMenuId = data[i].menuId;
    } else if (i === data.length - 1) {
      menuEndIndex = i;
      let rowsSpan: number;
      if (prevMenuId.toString() !== data[i].menuId.toString()) {
        rowsSpan = menuEndIndex - menuStartIndex;
      } else {
        rowsSpan = menuEndIndex - menuStartIndex + 1;
      }
      if (rowsSpan > 1) {
        Object.assign(menuMerges, { ['E' + (menuStartIndex + 1)]: [1, rowsSpan] });
        Object.assign(menuMerges, { ['G' + (menuStartIndex + 1)]: [1, rowsSpan] });
        Object.assign(menuMerges, { ['H' + (menuStartIndex + 1)]: [1, rowsSpan] });
        Object.assign(menuMerges, { ['I' + (menuStartIndex + 1)]: [1, rowsSpan] });
        Object.assign(menuMerges, { ['J' + (menuStartIndex + 1)]: [1, rowsSpan] });
      }
    }
  }

  return {
    ...branchMerges,
    ...departmentMerges,
    ...menuMerges,
  };
};