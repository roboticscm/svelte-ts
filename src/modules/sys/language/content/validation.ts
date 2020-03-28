import { CommonValidation } from '@/assets/js/common-validation';

export const validation = (form: any) => {
  const error: any = {};

  if (CommonValidation.isEmptyString(form.name)) {
    error.name = CommonValidation.REQUIRED_VALUE;
  }

  if (CommonValidation.isEmptyString(form.locale)) {
    error.locale = CommonValidation.REQUIRED_VALUE;
  }

  if (!CommonValidation.isIntegerNumber((form as any).sort)) {
    error.sort = CommonValidation.INTEGER_NUMBER;
  }
  return error;
};
