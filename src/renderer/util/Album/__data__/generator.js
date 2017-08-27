import md5 from 'md5';

const generateTrack = function generateTrack({
  album,
  artist,
  title,
  ext = '.mp3',
  track = 1,
  year = 1999,
  diskNo = 0,
  diskOf = 0,
  genre = 'Rock',
  duration = 194,
}) {
  const filename = `/path/to/${artist}/${album}/${track} - ${title}${ext}`
  const id = `t_${md5(filename)}`;
  return {
    id,
    filename,
    metadata: {
      album,
      artist,
      albumartist,
      duration,
      title,
      track,
      year,
      genre,
      disk: {
        no: diskNo,
        of: diskOf,
      },
    },
  };
};
