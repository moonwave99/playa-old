/* eslint import/no-extraneous-dependencies: 0 */

import test from 'tape';
import SettingsBag from './';

const data = {
  artist: 'Slowdive',
  title: 'Souvlaki',
};

test('get()', (assert) => {
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

test('set()', (assert) => {
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

test('all()', (assert) => {
  const bag = new SettingsBag({ data });

  assert.equal(
    bag.all(), data,
    'all() should return all data stored',
  );

  assert.end();
});
