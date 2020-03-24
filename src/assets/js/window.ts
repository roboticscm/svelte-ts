export class Window {
  public static getCenterWindowPosition(width: number, height: number) {
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    return {
      left: left,
      top: top
    };
  }
}
