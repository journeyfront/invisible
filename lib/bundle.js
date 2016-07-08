var browserify = require('browserify')
var shim = require('browserify-shim')
var coffeeify = require('coffeeify')
var path = require('path')
var fs = require('fs')

module.exports = function (rootFolder) {
  var src = null
  var b = browserify()
    .transform(coffeeify)
    .transform(shim)
    .ignore('mongodb')
    .ignore('argon2')
    .ignore('express')
    .ignore('./bundle')
    .ignore('./routes')
    .ignore('./router')
    .ignore('./config')
    .ignore('./auth')
    .ignore('socket.io')

  fs.readdirSync(rootFolder).filter(function (i) {
    return i.match(/\.model\.js$/) && !i.match(/\.spec\.js$/)
  }).forEach(function (modelName) {
    var modelFile = path.join(rootFolder, modelName)
    b.add(modelFile)
    console.log('added ' + modelName)
  })

  b.bundle(function (err, compiled) {
    if (err) {
      throw err
    }
    src = compiled
    console.log('universal-model: created bundle!')
  })

  return function (req, res, next) {
    if (req.path !== '/invisible.js') {
      return next()
    }
    res.contentType('application/javascript')
    res.send(src)
  }
}
