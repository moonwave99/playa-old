'use babel';

import { shell } from 'electron';

const DISCOGS_SEARCH_URL = 'http://www.discogs.com/search?type=release&q=';
const RYM_SEARCH_URL = 'https://rateyourmusic.com/search?searchtype=l&searchterm=';
const LASTFM_SEARCH_URL = 'http://www.last.fm/search?type=album&q=';

const openLink = function openLink(base, queryTerm) {
  shell.openExternal(base + encodeURIComponent(queryTerm));
};

export const revealInFinder = function revealInFinder(folder) {
  shell.openExternal(`file://${folder}`);
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

export default {
  revealInFinder,
  searchOnDiscogs,
  searchOnRym,
  searchOnLastfm,
};
