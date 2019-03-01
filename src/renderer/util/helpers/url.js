export const encodePath = function encodePath(filename) {
  return filename.replace('?', '%3F');
};

export default { encodePath };
