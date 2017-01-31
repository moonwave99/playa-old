import _, { isArray, reduce } from 'lodash';
import moment from 'moment';

const normaliseArtist = function normaliseArtist(value) {
  if (value.match(/, The$/)) {
    return `The ${value.replace(/, The$/, '')}`;
  }
  return value;
};

const formatDate = function formatDate(value) {
  return value ? moment(new Date(value.match(/\d{4}/)[0])).format('YYYY') : '-';
};

export default {
  normalise(metadata) {
    return reduce(metadata, (memo, value, _key) => {
      const key = _key.toLowerCase();
      let normalisedValue = null;
      switch (key) {
        case 'artist':
        case 'albumartist':
          if (isArray(value)) {
            normalisedValue = _(value)
              .map(normaliseArtist)
              .uniq()
              .value()
              .join(', ');
          } else {
            normalisedValue = normaliseArtist(value);
          }
          break;
        case 'track':
          normalisedValue = value ? value.no : 0;
          break;
        case 'year':
        case 'date':
          normalisedValue = formatDate(value);
          break;
        default:
          normalisedValue = value;
          break;
      }
      return Object.assign({ [key]: normalisedValue }, memo);
    }, {});
  },
};
