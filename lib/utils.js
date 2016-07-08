/*
 * Collects the response body, parses it as JSON and passes it to the callback.
 */
exports.handleResponse = function (cb) {
  return function (res) {
    var body = ''
    res.on('data', function (chunk) {
      body += chunk
    })
    return res.on('end', function () {
      console.dir(res)
      if (res.statusCode !== 200) {
        cb(new Error(res))
      } else {
        cb(null, JSON.parse(body))
      }
    })
  }
}

var db

exports.connectDB = function (cb) {
  if (db) {
    cb(db)
  } else {
    var mongo = require('mongodb')
    var config = require('./config')
    mongo.connect(config.db_uri, function (err, database) {
      if (err) {
        console.error('Error connecting database')
        throw err
      }
      console.log('database connected at ' + config.db_uri)
      db = database
      cb(database)
    })
  }
}
