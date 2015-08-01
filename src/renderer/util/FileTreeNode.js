"use babel"

var _ = require('lodash')
var fs = require('fs-extra')
var md5 = require('MD5')
var path = require('path')

module.exports = class FileTreeNode {
  constructor(options) {
    this.name = options.name
    this.path = options.path
    this.extension = options.extension
    this.id = md5(this.path)
    this.relativePath = options.relativePath
    this.parentNode = options.parentNode
    this.depth = +options.depth
    this.children = options.children || []
  }
  isRoot(){
    return !this.parentNode
  }
  isLeaf(){
    return this.children.length == 0
  }
  isDirectory(){
    return !this.extension
  }
  findByName(key = 'id', value){
    var criteria = {}
    criteria[key] = value
    return _.findWhere(this.children, criteria)
  }
  collapse(){
    this.children = []
  }
  delete(){
    return new Promise((resolve, reject)=>{
      fs.remove(this.path, (error)=>{
        if(error){ reject(error)
        }else{ resolve(this) }
      })
    })
  }
}
