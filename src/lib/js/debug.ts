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
