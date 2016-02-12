"use babel"

module.exports = class RemoteController {
  constructor(options) {
    this.active = false
  }
  isActive(){
    return !!this.active
  }
  start(){
    console.info('Remote control started on: ' + this.getAddress())
    this.active = true
  }
  stop(){
    console.info('Remote control stopped.')
    this.active = false
  }
  getAddress(){
    return 'http://192.168.1.3:1337'
  }
}
