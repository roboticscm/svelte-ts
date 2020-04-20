import { CommonValidation } from '@/lib/js/common-validation';

export const validation = (form: any) => {
  const error: any = {};

  if (CommonValidation.isEmptyString(form.name)) {
    error.name = CommonValidation.REQUIRED_VALUE;
  }

  if (!CommonValidation.isIntegerNumber((form as any).sort)) {
    error.sort = CommonValidation.INTEGER_NUMBER;
  }

  if (CommonValidation.isEmptyString(form.ownerOrgId)) {
    error.ownerOrgId = CommonValidation.SELECT_AT_LEAST_ONE_NODE;
  }

  return error;
};
