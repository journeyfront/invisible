var _ = require('underscore')
var Invisible = require('./invisible')

module.exports = function (app) {
  app.get('/invisible/:modelName', query)
  app.post('/invisible/:modelName', save)
  app.get('/invisible/:modelName/:id', show)
  app.put('/invisible/:modelName/:id', update)
  app.delete('/invisible/:modelName/:id', remove)
}

/**
 * If the user is defined in the request (i.e. authentication is on), and the
 * given model has an allow method with the given name, execute it to check if
 * the user is authorized to fulfill the request. If it's authorized call cb,
 * otherwise send a 401 response.
*/
function checkAuth (req, res, model, method, cb) {
  if (req.user && model[method]) {
    return model[method](req.user, function (err, authorized) {
      if (err || !authorized) {
        return res.sendStatus(401)
      }
      return cb()
    })
  } else {
    return cb()
  }
}

function query (req, res) {
  var criteria = {}
  if (req.query.query) {
    criteria = JSON.parse(req.query.query)
  }

  var opts = {}
  if (req.query.opts) {
    opts = JSON.parse(req.query.opts)
  }
  var Model = Invisible.models[req.params.modelName]
  Model.query(criteria, opts, function (e, results) {
    res.send(results)
  })
}

function save (req, res) {
  var Model = Invisible.models[req.params.modelName]
  var instance = new Model(req.body)

  checkAuth(req, res, instance, 'allowCreate', function () {
    instance.save(function (err, instance) {
      if (err) {
        return res.status(400).send(err)
      }
      return res.send(instance)
    })
  })
}

function show (req, res) {
  var Model = Invisible.models[req.params.modelName]

  try {
    Model.findById(req.params.id, function (e, result) {
      if (result) {
        checkAuth(req, res, result, 'allowFind', function () {
          var obj = JSON.parse(JSON.stringify(result))
          res.send(obj)
        })
      } else {
        res.sendStatus(404)
      }
    })
  } catch (err) {
    res.status(500).send(err)
  }
}

function update (req, res) {
  var Model = Invisible.models[req.params.modelName]
  Model.findById(req.params.id, function (err, instance) {
    if (err) {
      res.sendStatus(404)
    } else {
      return checkAuth(req, res, instance, 'allowUpdate', function () {
        _.extend(instance, req.body)
        instance.save(function (err, instance) {
          if (err) {
            res.status(400).send(err)
          } else {
            res.send(instance)
          }
        })
      })
    }
  })
}

function remove (req, res) {
  var Model = Invisible.models[req.params.modelName]

  Model.findById(req.params.id, function (e, instance) {
    if (instance) {
      checkAuth(req, res, instance, 'allowDelete', function () {
        instance.delete(function (err) {
          if (err) {
            return res.sendStatus(500)
          }

          res.sendStatus(200)
        })
      })
    } else {
      res.sendStatus(404)
    }
  })
}
