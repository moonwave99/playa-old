/* eslint import/no-extraneous-dependencies: 0 */
/* eslint react/jsx-filename-extension: 0 */
/* eslint jsx-a11y/heading-has-content: 0 */

import tape from 'tape';
import addAssertions from 'extend-tape';
import jsxEquals from 'tape-jsx-equals';
import React from 'react';
import { createRenderer } from 'react-addons-test-utils';
import InfoDrawer from './';

const test = addAssertions(tape, { jsxEquals });
const renderer = createRenderer();
const metadata = {
  length: '3:14',
  sample_rate: '44100 Hz',
};

test('InfoDrawer without metadata', (assert) => {
  renderer.render(<InfoDrawer />);

  const message = 'Should render a placeholder';
  const expected = (
    <div className="info-drawer">
      <h3 />
      <p />
    </div>
  );
  const actual = renderer.getRenderOutput();

  assert.jsxEquals(actual, expected, message);
  assert.end();
});

test('InfoDrawer with metadata', (assert) => {
  renderer.render(<InfoDrawer audioMetadata={metadata} />);

  const message = 'Should render a placeholder';
  const expected = (
    <div className="info-drawer">
      <h3 />
      <ul className="list-unstyled track-info">
        <li key="length">
          <span className="key">length:</span>
          <span className="value">3:14</span>
        </li><li key="length">
          <span className="key">sample rate:</span>
          <span className="value">44100 Hz</span>
        </li>,
      </ul>
    </div>
  );
  const actual = renderer.getRenderOutput();

  assert.jsxEquals(actual, expected, message);
  assert.end();
});
