import test from 'tape';
import Album from './';
import PlaylistItem from '../PlaylistItem';
import data from './__data__/album';

test('Album # contains()', (assert) => {
  const album = new Album({
    id: data.id,
    tracks: data.tracks.map(track => new PlaylistItem(track)),
  });
  assert.equal(
    album.contains(data.tracks[0].id),
    true,
    'should return true if album contains given track id',
  );
  assert.equal(
    album.contains('unexisting_id'),
    false,
    'should return false if album does not contain given track id',
  );
  assert.end();
});

test('Album # missingTracksCount()', (assert) => {
  const tracks = [1, 2, 3]
    .map(n => ({ filename: `path/to/filename_${n}.mp3`, disabled: n % 2 }))
    .map(track => new PlaylistItem(track));
  const album = new Album({
    id: data.id,
    tracks,
  });
  assert.equal(
    album.missingTracksCount(),
    tracks.filter(track => track.disabled).length,
    'should return the number of disabled tracks',
  );
  assert.end();
});
