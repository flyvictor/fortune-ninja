var _ = require("lodash"),
    mongo = require("mongodb").MongoClient,
    fs = require("fs"),
    when = require("when"),
    fixtureFactory = require("./fixture-factory"),
    httpClient = require("./http-client"),
    util = require("./util"),
    sinon = require("sinon");


module.exports = function(ninjaOpt){
  var databases = [];

  //TODO: checks for compulsory opts
  var self = {
    util: util,
    connect: function(opt){
      opt = _.extend({},ninjaOpt,opt);
      
      var fc = opt.fortuneClient,
          ff = fixtureFactory(fc);
      
      _.extend(self,{
        fixture: ff,
        request: httpClient({baseUrl: opt.baseUrl}),
        fortuneClient: fc,
        baseUrl: opt.baseUrl
      });

      if(opt.fixtureTemplates) ff.loadTemplates(opt.fixtureTemplates);

      return setupDb(opt.databases);
    },
    setupSandbox: function(){
      self.sandbox = sinon.sandbox.create();
    },
    setupClock: function(){
      self.clock = sinon.useFakeTimers();
    },
    wipeCollections: function(){
      return when.all(_.map(databases, function(db){
        return when.promise(function(resolve,reject){
          db.collections(function(err, collections){
            when.all(_.map(_.reject(collections, function(col){//reject
              //return !(col.collectionName === "system.indexes") &&
              return /^system/.test(col.collectionName);
            }),function(collection){//map
              return when.promise(function(resolve,reject){
                collection.remove({}, function(err){
                  return err ? reject(err) : resolve(err);
                });
              });
            })).then(resolve);
          });
        });
      })).then(function(){});
    },
    reset: function(){
      self.sandbox && self.sandbox.restore();
      self.clock && self.clock.restore();
      self.request.reset();
    }
  };

  
  function setupDb(dbStrings){
    return when.all(_.map(dbStrings, function(dbstring){
      return when.promise(function(resolve, reject){
        //TODO: for each self.databases
        mongo.connect(dbstring, function(err, db){
          if(err){
            reject(err);
          }else{
            databases.push(db);
            resolve();
          }
        });
      });
    }));
  }

  return self;
};


