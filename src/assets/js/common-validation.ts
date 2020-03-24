export default class CommonValidation {
  public static REQUIRED_VALUE = 'COMMON.MSG.REQUIRED_VALUE';
  public static isEmptyString(source: string) {
    if (!source) {
      return true;
    }

    return source.trim().length === 0;
  }

  public static INTEGER_NUMBER = 'COMMON.MSG.REQUIRED_INTEGER_NUMBER';
  public static isIntegerNumber(source: string) {
    const reg = new RegExp(/^\d+$/);
    return reg.test(source);
  }

  public static INTEGER_NUMBER_IN_RANGE = 'COMMON.MSG.INTEGER_NUMBER_IN_RANGE';
  public static isIntegerInRange(source: string, from: number, to: number) {
    const reg = new RegExp(/^\d+$/);
    const isNumber = reg.test(source);

    if (!isNumber) {
      return false;
    }

    const number = Number(source);
    return number >= from && number <= to;
  }
}
