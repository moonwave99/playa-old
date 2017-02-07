import test from 'tape';
import { AudioMetadata } from './__stubs__';

test('AudioMetadata # load()', (assert) => {
  const bitRate = AudioMetadata.load('path/to/file_1.mp3')
    .then((metadata) => {
      assert.equal(
        metadata.bit_rate,
        192,
        'should return bitrate in kbps',
      );
      assert.equal(
        metadata.sample_rate,
        44100,
        'should return sample_rate',
      );
      assert.equal(
        metadata.format,
        'MP3 (MPEG audio layer 3)',
        'should return codec name',
      );
      assert.equal(
        metadata.channels,
        2,
        'should return channel number',
      );
      assert.equal(
        metadata.channel_layout,
        'stereo',
        'should return channel layout',
      );
    });
  const noBitrate = AudioMetadata.load('path/to/file_no_bitrate.mp3')
    .then((metadata) => {
      assert.equal(
        metadata.bit_rate,
        AudioMetadata.BITRATE_NOT_AVAILABLE,
        `should return ${AudioMetadata.BITRATE_NOT_AVAILABLE} if bitrate is not available`,
      );
    });
  Promise.all([bitRate, noBitrate]).then(() => assert.end());
});
