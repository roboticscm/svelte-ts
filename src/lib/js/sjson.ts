// @ts-ignore
const JSONbig = require('json-bigint');

export class SJSON {
  // public static stringify = (obj: any) => {
  //   return JSON.stringify(obj, (key, value) => {
  //     if (typeof value === 'bigint') {
  //       return value ? value.toString() : value;
  //     } else {
  //       return value;
  //     }
  //   });
  // };
  public static stringify = (obj: any) => {
    return JSONbig.stringify(obj);
  };

  // public static parse = (json: string) => {
  //     return JSON.parse(json, (key, value) => {
  //         if (typeof value === 'string' && /^\d+n$/.test(value)) {
  //             return BigInt(value.slice(0, -1));
  //         } else if (typeof value === 'number') {
  //             if (value > Number.MAX_SAFE_INTEGER) {
  //                 return BigInt(value);
  //             } else {
  //                 return value;
  //             }
  //         }
  //         return value;
  //     });
  // }

  public static parse = (json: string) => {
    // return JSONbig.parse(json, (key, value) => {
    //   if (value && value.constructor && value.constructor.name === 'BigNumber') {
    //     // @ts-ignore
    //     return BigInt(value.toString());
    //   }
    //   return value;
    // });

    return JSONbig.parse(json);
  };

  public static isJson = (str: string) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };
}
