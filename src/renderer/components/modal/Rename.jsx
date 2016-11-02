"use babel"

var React = require('react')
var ReactDOM = require('react-dom')
var ReactPropTypes = React.PropTypes
var ReactCSSTransitionGroup = require('react/lib/ReactCSSTransitionGroup')
var cx = require('classnames')

var t = require('tcomb-form')
var Form = t.form.Form

var Rename = React.createClass({
  getInitialState: function(){
    return {
      value: {
        name: this.props.item.name
      }
    }
  },
  componentDidMount: function(){
    this.refs.formElement.querySelector('input[name="name"]').focus()
  },
  render: function() {
    var Model = t.struct({
      name: t.Str
    })
    var options = {
      fields: {
        name: {
          label: <span>Rename {this.props.item.name}:</span>
        }
      }
    }
    return (
      <form onSubmit={this.onSubmit} ref="formElement">
        <Form type={Model} value={this.state.value} options={options} ref="form"/>
      </form>
    )
  },
  onSubmit(event) {
    event.preventDefault()
    var value = this.refs.form.getValue()
    this.props.handleSubmit(this.props.item, value.name)
  }
})

module.exports = Rename
