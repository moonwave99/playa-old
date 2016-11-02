"use babel"

var React = require('react')
var ReactDOM = require('react-dom')
var ReactPropTypes = React.PropTypes
var key = require('keymaster')
var cx = require('classnames')

var ModalActions = require('../actions/ModalActions')

var Modal = React.createClass({
  getInitialState: function(){
    return {
      isKeyBound: false
    }
  },
  componentWillUnmount: function(){
    this.unbindKeyHandler();
  },
  componentDidUpdate: function(prevProps, prevState){
    if(prevProps.isVisible !== this.props.isVisible){
      if(this.props.isVisible){
        this.refs.modal.classList.add('in')
        if(this.props.isDismissable && !this.state.isKeyBound){
          this.bindKeyHandler()
          this.setState({ isKeyBound: true})
        }
      }
    }
  },
  render: function() {
    var classes = cx({
      modal: true,
      isVisible: this.props.isVisible
    })
    if(this.props.params.component){
      var Component = require('./modal/' + this.props.params.component + '.jsx')
      return (
        <div className={classes} onClick={this.props.isDismissable ? this.handleBackgroundClick : null} ref="modal">
          <div className="modal-inner" onClick={this.props.isDismissable ? this.handleInnerClick : null}><Component {...this.props.params}/></div>
        </div>
      )
    }else{
      return null
    }
  },
  bindKeyHandler: function(){
    key('esc', this.handleEscKeyPress)
  },
  unbindKeyHandler: function(){
    key.unbind('esc', this.handleEscKeyPress)
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
