export const applyLeftGutterState = (leftGutterMore: boolean) => {
  let el = document.querySelector('#insideLeftGutter');
  if (leftGutterMore) {
    el.classList.remove('inside-left-gutter-more');
    el.classList.add('inside-left-gutter-less');
  } else {
    el.classList.remove('inside-left-gutter-less');
    el.classList.add('inside-left-gutter-more');
  }
};

export const leftCollapse = (
  split: any,
  leftGutterMore: boolean,
  lastLeftContentWidth: number,
  delta: number
): boolean => {
  const oldSizes = split.getSizes();
  let newSizes: any[];
  leftGutterMore = !leftGutterMore;
  if (leftGutterMore) {
    newSizes = [0, oldSizes[0] + oldSizes[1]];
  } else {
    newSizes = [lastLeftContentWidth, oldSizes[1] - lastLeftContentWidth + delta];
  }

  split.setSizes(newSizes);

  applyLeftGutterState(leftGutterMore);

  return leftGutterMore;
};
