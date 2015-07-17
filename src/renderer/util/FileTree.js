"use babel"

var _ = require('lodash')
var path = require('path')
var Promise = require('bluebird')
var FileTreeNode = require('./FileTreeNode')

module.exports = class FileTree {
  constructor(options) {
    this.rootFolder = options.rootFolder
    this.fileBrowser = options.fileBrowser
    this.rootNode = null
    this.filter = options.filter || 'directory'
    this.rootNode = new FileTreeNode({
      name: '/',
      path: this.rootFolder,
      relativePath: '',
      depth: 0
    })
  }
  loadRoot(){
    return this.expand([this.rootNode])
  }
  expandSingleNode(node){
    return this.fileBrowser.load(node.path, this.filter).then((content)=>{
      node.children = content.sort().map((folder)=>{
        var relativePath = path.relative(this.rootFolder, folder)
        var ext = this.filter == 'directory' ? '' : path.extname(relativePath)
        return new FileTreeNode({
          name: path.basename(relativePath, ext),
          path: folder,
          extension: ext,
          relativePath: relativePath,
          parentNode: node,
          depth: node.depth+1
        })
      })
    })
  }
  expand(nodes){
    return Promise.all(nodes.map( n => this.expandSingleNode(n) ))
  }
  collapse(nodes){
    nodes.forEach( n => n.collapse() )
  }
  flatten(){
    var memo = []
    var _flatten = function(node){
      memo.push(node)
      node.children.forEach( i => _flatten(i) )
    }
    _flatten(this.rootNode)
    return memo
  }
}
