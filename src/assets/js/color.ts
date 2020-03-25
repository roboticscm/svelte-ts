export default class Color {
  public static hexToRGBA(hex: string, alpha: number) {
    let r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
    } else {
      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
  }

  public static changeAlphaOfRGBA(rgba: string, alpha: number) {
    return rgba.replace(/[^,]+(?=\))/, `${alpha}`);
  }

  public static applyApha(colors: any[], alpha: number) {
    const body: any = document.querySelector('body');
    colors.map((item) => {
      const key = Object.keys(item)[0];
      const value = item[key];
      let newColor: any = null;
      if (value.startsWith('#')) {
        newColor = Color.hexToRGBA(value, alpha);
      } else {
        newColor = Color.changeAlphaOfRGBA(value, alpha);
      }

      body.style.setProperty(key, newColor);
    });
  }
}

export const getThemeColors = () => {
  const body: any = document.querySelector('body');
  return [
    {
      ['--bg-primary']: getComputedStyle(body as any)
        .getPropertyValue('--bg-primary')
        .trim(),
    },
    {
      ['--bg-secondary']: getComputedStyle(body as any)
        .getPropertyValue('--bg-secondary')
        .trim(),
    },
    {
      ['--bg-tertiary']: getComputedStyle(body as any)
        .getPropertyValue('--bg-tertiary')
        .trim(),
    },
    {
      ['--bg-gradient-from']: getComputedStyle(body as any)
        .getPropertyValue('--bg-gradient-from')
        .trim(),
    },
    {
      ['--bg-gradient-to']: getComputedStyle(body as any)
        .getPropertyValue('--bg-gradient-to')
        .trim(),
    },
  ];
};
