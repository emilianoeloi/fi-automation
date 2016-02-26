import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';

import expect from 'expect';

import {SampleComponent} from '../src/sample-component.js';


describe('Sample Component', () => {
  beforeEach(function() {
    this.component = TestUtils.renderIntoDocument(<SampleComponent />);
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this.component));
  });

  it('renders without problems', function() {
    expect(this.component).toExist();
  });

  it('should render Hello Component', function() {
    let textarea = TestUtils.findRenderedDOMComponentWithTag(this.component, 'textarea');
    expect(textarea.textContent).toEqual('Blah blah blah')
  });
});
