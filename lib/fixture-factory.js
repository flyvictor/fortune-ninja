var _ = require("lodash"),
    when = require("when"),
    sinon = require("sinon"),
    util = require("./util");

//TODO: compound fixtures
//TODO: dynamic fields
module.exports = function(client){
  var templates = {};
  var self = {
    loadTemplates: function(tmps){
      templates = tmps;
    },
    create: function(name,fields){
      var resource = _.findWhere(client.resources, {route:name}),
          fixtures;

      if(!resource) throw new Error("Fixture factory; resource not found: " + name);

      return assembleFixture(resource,fields).then(function(res){
        fixtures = res;
        return client.create(resource.route, res[name]);
      }).then(function(data){
        fixtures[name] = data[name];
        return fixtures;
      });
    }
  };

  function assembleFixture(schema, customFieldList){
    var assembledResources = {};
    if(!_.isArray(customFieldList)) customFieldList = [customFieldList];

    return when.all(_.map(customFieldList, function(customFields){
      var rawDoc = _.extend({},templates[schema.name], customFields);

      return when.all(_.map(rawDoc, function(val, key){
        if (val && val.then){
          var type = schema.schema[key],
              isArray = _.isArray(type);

          type = _.findWhere(client.resources,{name: (isArray ? type[0] : type).ref}).route;

          if(type){
            return val.then(function(data){
              var dependency = data[type];
              rawDoc.links = rawDoc.links || {};
              rawDoc.links[key] = isArray ? _.pluck(dependency, "id") : dependency[0].id;
              
              _.each(data, function(depDocs, depType){
                assembledResources[depType] = _.uniq(
                  (assembledResources[depType] || []).concat(depDocs),
                  "id"
                );
              });
            });
          }
        }

        return val;
      })).then(function(){
        return rawDoc;
      });
    })).then(function(res){
      assembledResources[schema.route] = res;
      return assembledResources;
    });
  }

  function sandboxed(cb){
    var sandbox = sinon.sandbox.create();

    return when.resolve(cb(sandbox)).then(function(data){
      sandbox.restore();
      return data;
    });
  }

  return self;
};
