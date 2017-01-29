'use babel';

import { shell } from 'electron';

const DISCOGS_SEARCH_URL = 'http://www.discogs.com/search?type=release&q=';
const RYM_SEARCH_URL = 'https://rateyourmusic.com/search?searchtype=l&searchterm=';
const LASTFM_SEARCH_URL = 'http://www.last.fm/search?type=album&q=';
const LASTFM_USER_URL = 'http://www.last.fm/user/';

const openLink = function openLink(base, queryTerm) {
  let link = base;
  if (queryTerm) {
    link += encodeURIComponent(queryTerm);
  }
  shell.openExternal(link);
};

export const revealInFinder = function revealInFinder(folder) {
  openLink(`file://${folder}`);
};
export const searchOnDiscogs = function searchOnDiscogs(queryTerm) {
  openLink(DISCOGS_SEARCH_URL, queryTerm);
};
export const searchOnRym = function searchOnRym(queryTerm) {
  openLink(RYM_SEARCH_URL, queryTerm);
};
export const searchOnLastfm = function searchOnLastfm(queryTerm) {
  openLink(LASTFM_SEARCH_URL, queryTerm);
};
export const openLastfmUser = function openLastfmUser(user) {
  openLink(`${LASTFM_USER_URL}${user}`);
};

export default {
  revealInFinder,
  searchOnDiscogs,
  searchOnRym,
  searchOnLastfm,
  openLastfmUser,
};
