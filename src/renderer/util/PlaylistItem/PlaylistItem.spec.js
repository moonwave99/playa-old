import test from 'tape';
import PlaylistItem from './';

const data = {
  duration: 194,
  filename: 'path/to/file.mp3',
  metadata: {
    title: 'Dagger',
    artist: 'Slowdive',
    album: 'Souvlaki',
    disk: {
      no: 1,
    },
  },
};

test('PlaylistItem # formattedTitle()', (assert) => {
  const item = new PlaylistItem(data);
  assert.equals(
    item.formattedTitle(),
    `${data.metadata.artist} - ${data.metadata.title}`,
    'should return "artist - title"',
  );

  assert.end();
});

test('PlaylistItem # getDiscNumber()', (assert) => {
  const item = new PlaylistItem(data);
  assert.equals(
    item.getDiscNumber(),
    data.metadata.disk.no,
    'should return disc number from metadata',
  );

  const zeroItem = new PlaylistItem({
    filename: 'path/to/file.mp3',
    metadata: {
      disk: {
        no: 0,
      },
    },
  });
  assert.equals(
    zeroItem.getDiscNumber(),
    1,
    'should return 1 if disc number is < 1',
  );

  const disabledItem = new PlaylistItem({
    disabled: true,
    filename: 'path/to/file.mp3',
  });
  assert.equals(
    disabledItem.getDiscNumber(),
    0,
    'should return 0 if item is disabled',
  );

  assert.end();
});

test('PlaylistItem # serializeForRemote()', (assert) => {
  const item = new PlaylistItem(data);
  const keys = ['id', 'title', 'artist', 'track', 'duration', 'audioMetadata'];
  assert.deepEqual(
    Object.keys(item.serializeForRemote()),
    keys,
    `should contain ${keys.map(k => `'${k}'`).join(', ')} keys`,
  );

  const disabledItem = new PlaylistItem({
    disabled: true,
    filename: 'path/to/file.mp3',
  });
  assert.deepEqual(
    disabledItem.serializeForRemote(),
    {},
    'should return an empty hash if item is disabled',
  );

  assert.end();
});
