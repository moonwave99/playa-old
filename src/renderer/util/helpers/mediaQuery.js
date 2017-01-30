'use babel';

export const minWidth = function minWidth(value) {
  return `screen and (min-width: ${value})`;
};

export const maxWidth = function maxWidth(value) {
  return `screen and (max-width: ${value})`;
};

export default {
  minWidth,
  maxWidth,
};
