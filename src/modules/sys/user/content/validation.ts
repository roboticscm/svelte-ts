import { CommonValidation } from '@/assets/js/common-validation';
import { App } from '@/assets/js/constants';

export const validation = (form: any) => {
  const error: any = {};

  if (CommonValidation.isEmptyString(form.username)) {
    error.username = CommonValidation.REQUIRED_VALUE;
  }

  if (!CommonValidation.isValidEmail(form.email)) {
    error.email = CommonValidation.INVALID_EMAIL;
  }

  if (!CommonValidation.isMinLength(form.password, App.MIN_PASSWORD_LENGTH)) {
    error.password = CommonValidation.MIN_LENGTH.replace('%min%', App.MIN_PASSWORD_LENGTH + '');
  }

  if (CommonValidation.isEmptyString(form.defaultOwnerOrgId)) {
    error.defaultOwnerOrgId = CommonValidation.SELECT_AT_LEAST_ONE_LEAF_NODE;
  }

  return error;
};
