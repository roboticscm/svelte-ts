export class OwnerOrg {
  parentId = '';
  id = '';
  code = '';
  name = '';
  fontIcon = '';
  useFontIcon = false;
  iconData = '';
  type = -2;
  slogan = '';
  houseNumber = '';
  country = -1;
  city = -1;
  district = -1;
  ward = -1;
  tel = '';
  email = '';
  facebook = '';
  twitter = '';
  skype = '';
  disabled = false;
  sort = 0;
}

export enum OrgType {
  Campany = 10000,
  Branch = 1000,
  Department = 100,
  Group = 10,
}
