import test from 'tape';
import Path from 'path';
import jetpack from 'fs-jetpack';
import SettingsBag from './';

const before = test;

const TEST_DATA_FOLDER = Path.join(process.cwd(), 'test_data', 'SettingsBag');
const TEST_DATA_PATH = Path.join(TEST_DATA_FOLDER, 'data.json');
const TEST_DATA_SAVE_PATH = Path.join(TEST_DATA_FOLDER, 'data_save.json');

const data = {
  artist: 'Slowdive',
  title: 'Souvlaki',
};

before('SettingsBag # before', (assert) => {
  jetpack.remove(TEST_DATA_FOLDER);
  assert.pass('Delete data');
  assert.end();
});

test('SettingsBag # get()', (assert) => {
  const bag = new SettingsBag({ data });

  assert.equal(
    bag.get('artist'), data.artist,
    'get(key) should retrieve the value stored',
  );

  assert.equal(
    bag.get('ABSENT_KEY'), undefined,
    'get(key) should return undefined if no value for key is stored',
  );

  assert.end();
});

test('SettingsBag # set()', (assert) => {
  const bag = new SettingsBag({ data });
  const newTitle = 'Just for a Day';
  const returnBag = bag.set('title', newTitle);

  assert.equal(
    returnBag, bag,
    'set(key, value) should return the bag itself',
  );

  assert.equal(
    bag.get('title'), newTitle,
    'set(key, value) should set value for key',
  );

  const readOnlyBag = new SettingsBag({ data, readOnly: true });
  readOnlyBag.set('title', newTitle);

  assert.equal(
    readOnlyBag.get('title'), data.title,
    'set(key, value) should do nothing if bag is readOnly',
  );
  assert.end();
});

test('SettingsBag # all()', (assert) => {
  const bag = new SettingsBag({ data });

  assert.deepEqual(
    bag.all(), data,
    'all() should return all data stored',
  );

  assert.end();
});

test('SettingsBag # load()', (assert) => {
  jetpack.write(TEST_DATA_PATH, data);
  const bag = new SettingsBag({ path: TEST_DATA_PATH });
  const loadedBag = bag.load();

  assert.equal(
    loadedBag, bag,
    'load() should return the bag itself',
  );

  assert.deepEqual(
    bag.all(), data,
    'load() should load data stored in path',
  );

  bag.path = 'nowhere';
  assert.throws(bag.load, 'load() should throw an Error if path does not exist');
  assert.end();
});

test('SettingsBag # save()', (assert) => {
  const bag = new SettingsBag({ data, path: TEST_DATA_SAVE_PATH });
  const savedBag = bag.save();

  assert.equal(
    savedBag, bag,
    'save() should return the bag itself',
  );

  const savedData = jetpack.read(TEST_DATA_SAVE_PATH, 'json');

  assert.deepEqual(
    bag.all(), savedData,
    'save() should save data to path',
  );

  const readOnlyData = Object.assign({}, data, { title: 'Just for a Day' });
  const readOnlyBag = new SettingsBag({
    data: readOnlyData,
    path: TEST_DATA_SAVE_PATH,
    readOnly: true,
  });

  readOnlyBag.save();
  const readOnlySavedData = jetpack.read(TEST_DATA_SAVE_PATH, 'json');

  assert.notSame(
    readOnlySavedData, readOnlyData,
    'save() should not write anything if bag is readonly',
  );

  assert.end();
});
