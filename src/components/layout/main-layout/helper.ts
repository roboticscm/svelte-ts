export const applyLayout = () => {
  const gridEle: any = document.querySelector('.layout-container');
  const bodyEle: any = document.querySelector('body');
  const [newHeaderHeight] = gridEle.style['grid-template-rows'].split(' ');

  const largeIconSizePlus = `${Number(newHeaderHeight.replace('px', '')) / 2}px`;
  const veryLargeIconSize = `${(Number(newHeaderHeight.replace('px', '')) * 3) / 4}px`;
  const largeIconSize = `${(Number(newHeaderHeight.replace('px', '')) * 1.5) / 4}px`;
  const avatarSize = `${Number(newHeaderHeight.replace('px', '')) - 10}px`;

  bodyEle.style.setProperty('--header-height', newHeaderHeight);
  bodyEle.style.setProperty('--large-icon-size-plus', largeIconSizePlus);
  bodyEle.style.setProperty('--very-large-icon-size', veryLargeIconSize);
  bodyEle.style.setProperty('--large-icon-size', largeIconSize);
  bodyEle.style.setProperty('--avatar-size', avatarSize);
};
