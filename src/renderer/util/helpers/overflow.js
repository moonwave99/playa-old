export const overflowsParent = function overflowsParent(parent, element) {
  const parentBounds = parent.getBoundingClientRect();
  const elBounds = element.getBoundingClientRect();
  let direction = 0;
  if ((elBounds.top + elBounds.height) > (parentBounds.top + parentBounds.height)) {
    direction = 1;
  } else if (elBounds.top < parentBounds.top) {
    direction = -1;
  }
  return {
    direction,
    parentBounds,
    elBounds,
  };
};

export default {
  overflowsParent,
};
