export class Settings {
  menuPath: string;
  controlId: string;
  keys: string[];
  values: string[];

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
