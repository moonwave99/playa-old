'use babel';

import moment from 'moment';
import momentDurationFormat from 'moment-duration-format';  // eslint-disable-line

export const formatTimeLong = function formatTime(time) {
  return moment.duration(time, 'seconds').format('hh [hours and] mm [minutes]', { trim: false });
};

export const formatTimeShort = function formatTime(time) {
  return moment.duration(time, 'seconds').format('mm:ss', { trim: false });
};

export default {
  formatTimeLong,
  formatTimeShort,
};
