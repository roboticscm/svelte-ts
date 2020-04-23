const isDebugMode = (): boolean => {
  // @ts-ignore
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';
};

export const log = (...message: any) => {
  if (isDebugMode()) {
    console.log(message);
  }
};

export const logSection = (section: string, ...message: any) => {
  if (isDebugMode()) {
    console.log(`---------${section}--------`);
    console.log(message);
  }
};

export const error = (...message: any) => {
  if (isDebugMode()) {
    console.error(message);
  }
};

export const errorSection = (section: string, ...message: any) => {
  if (isDebugMode()) {
    console.error(`---------${section}--------`);
    console.error(message);
  }
};

// @Deprecated
export class Debug {
  public static isDebugMode(): boolean {
    return true;
  }

  public static log(...message: any): void {
    if (this.isDebugMode()) {
      console.log(message);
    }
  }

  public static logSection(section: string, ...message: any): void {
    if (this.isDebugMode()) {
      console.log(`---------${section}--------`);
      console.log(message);
    }
  }

  public static error(...message: any): void {
    if (this.isDebugMode()) {
      console.error(message);
    }
  }

  public static errorSection(section: string, ...message: any): void {
    if (this.isDebugMode()) {
      console.error(`---------${section}--------`);
      console.error(message);
    }
  }
}
