"use babel"

var React = require('react')
var ReactPropTypes = React.PropTypes
var key = require('keymaster')
var cx = require('classnames')

var ModalActions = require('../actions/ModalActions')

var Modal = React.createClass({
  componentDidMount: function(){
    key('esc', this.handleEscKeyPress)
  },
  componentWillUnmount: function(){
    key.unbind('esc', this.handleEscKeyPress)
  },
  render: function() {
    var classes = cx({
      modal: true,
      isVisible: this.props.isVisible
    })
    if(this.props.params.component){
      var Component = require('./modal/' + this.props.params.component + '.jsx')
      return (
        <div className={classes} onClick={this.handleBackgroundClick}>
          <div className="modal-inner" onClick={this.handleInnerClick}><Component {...this.props.params}/></div>
        </div>
      )
    }else{
      return null
    }
  },
  handleEscKeyPress: function(event){
    ModalActions.hide()
  },
  handleBackgroundClick: function(event){
    ModalActions.hide()
  },
  handleInnerClick: function(event){
    event.stopPropagation()
  }
})

module.exports = Modal
