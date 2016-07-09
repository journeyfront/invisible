var browserify = require('browserify')
var coffeeify = require('coffeeify')
var path = require('path')
var fs = require('fs')

module.exports = function (rootFolder) {
  var src = null
  browserify(
    fs.readdirSync(rootFolder).filter(function (i) {
      return i.match(/\.model\.js$/) && !i.match(/\.spec\.js$/)
    }).map(function (model) {
      console.log('universal-model: found: ' + model)
      var p = path.join(rootFolder, model)
      setTimeout(function () {
        require(p)
      }, 0)
      return p
    }),
    {
      transform: [
        coffeeify
      ]
    }
  )
    .ignore('socket.io')
    .ignore('mongodb')
    .ignore('argon2')
    .ignore('express')
    .ignore('./bundle')
    .ignore('./routes')
    .ignore('./router')
    .ignore('./config')
    .ignore('./auth')
    .bundle(function (err, compiled) {
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
