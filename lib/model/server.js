'use strict'

var mongo = require('mongodb')
var _ = require('underscore')
var connectDB = require('../utils').connectDB

var ObjectID = mongo.ObjectID

function cleanArray (arr) {
  if (arr) {
    return arr.filter(function (id) {
      return _.isString(id)
    }).map(function (id) {
      return ObjectID(id)
    })
  }
}

function cleanQuery (query) {
  if (query._id) {
    if (_.isString(query._id)) {
      query._id = ObjectID(query._id)
    } else if (_.isObject(query._id)) {
      if (query._id.$in) {
        query._id.$in = cleanArray(query._id.$in)
      }
      if (query._id.$nin) {
        query._id.$nin = cleanArray(query._id.$nin)
      }
    }
  }
}

module.exports = function (InvisibleModel) {
  InvisibleModel.findById = function (id, cb) {
    connectDB(function (db) {
      var col = db.collection(InvisibleModel.modelName)
      col.findOne({
        _id: new ObjectID(id)
      }, function (err, result) {
        if (err) {
          return cb(err)
        }
        if (!result) {
          return cb(new Error('Inexistent id'))
        }
        var model = _.extend(new InvisibleModel(), result)
        model._id = model._id.toString()
        return cb(null, model)
      })
    })
  }
  InvisibleModel.query = function (query, opts, cb) {
    connectDB(function (db) {
      var col = db.collection(InvisibleModel.modelName)
      if (!cb) {
        if (!opts) {
          cb = query
          query = {}
        } else {
          cb = opts
        }
        opts = {}
      }
      cleanQuery(query)
      col.find(query, {}, opts).toArray(function (err, results) {
        if (err) {
          return cb(err)
        }
        var models = results.map(function (model) {
          return new InvisibleModel(model)
        })
        cb(null, models)
      })
    })
  }
  InvisibleModel.prototype.save = function (cb) {
    var model = this
    connectDB(function (db) {
      return model.validate(function (result) {
        if (!result.valid && cb) {
          return cb(result.errors)
        }
        var update = function (err, result) {
          if (err && cb) {
            return cb(err)
          }
          if (!model._id) {
            model._id = result.ops[0]._id.toString()
            InvisibleModel.emit('new', model)
          } else {
            InvisibleModel.emit('update', model)
          }
          if (cb) {
            return cb(null, model)
          }
        }
        var col = db.collection(InvisibleModel.modelName)
        // strip methods
        var data = JSON.parse(JSON.stringify(model))
        if (model._id) {
          data._id = new ObjectID(model._id)
        }
        col.save(data, update)
      })
    })
  }
  InvisibleModel.prototype.delete = function (cb) {
    var model = this
    connectDB(function (db) {
      var col = db.collection(InvisibleModel.modelName)
      col.remove({
        _id: ObjectID(model._id)
      }, function (err, result) {
        if (cb) {
          if (err) {
            return cb(err)
          }
          if (!result) {
            return cb(new Error('No result when saving'))
          }

          InvisibleModel.emit('delete', model)
          return cb(null, result)
        }
      })
    })
  }
  return InvisibleModel
}
