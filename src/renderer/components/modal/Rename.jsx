'use babel';

import React, { Component as ReactComponent, PropTypes } from 'react';
import { form, struct, Str } from 'tcomb-form';

const Form = form.Form;

class Rename extends ReactComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: {
        name: this.props.item.name,
      },
    };
    this.onSubmit = this.onSubmit.bind(this);
  }
  componentDidMount() {
    this.formElement.querySelector('input[name="name"]').focus();
  }
  render() {
    const Model = struct({
      name: Str,
    });
    const options = {
      fields: {
        name: {
          label: <span>Rename {this.props.item.name}:</span>,
        },
      },
    };
    return (
      <form
        onSubmit={this.onSubmit}
        ref={(c) => { this.formElement = c; }}
      >
        <Form
          type={Model}
          value={this.state.value}
          options={options}
          ref={(c) => { this.form = c; }}
        />
      </form>
    );
  }
  onSubmit(event) {
    event.preventDefault();
    const value = this.refs.form.getValue();
    this.props.handleSubmit(this.props.item, value.name);
  }
}

Rename.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string,
  }),
};

module.exports = Rename;
