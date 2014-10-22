var requesto = require("requesto"),
    when = require("when"),
    _ = require("lodash");

module.exports = function(initOpt){
  initOpt = initOpt || {};
  
  var configOpt = {},
      baseUrl = initOpt.baseUrl;
  
  var self = {
    baseUrl: function(url){
      return url ? (baseUrl = url) : url;
    },
    configure: function(conf){
      _.merge(configOpt, conf);
    },
    reset: function(){
      configOpt = {};
    }
  };

  /* WARN: found a possible bug in request (requesto / request-promise core dep): oauth tends to
   * produce signatures not matching our signatures when you include nested objects in qs (e.g.
   * filter:{ dog : "cat" }). After a bit of digging found that the oauth dependency used by request
   * toString's such objects, so the actual url used in the base string would have
   * filter = [object Object] instead of filter[dog]=cat in it. I think this isn't intentional,
   * just been too lazy to raise the issue on github...
   */
  var httpMethods =  _.reduce(requesto, function(memo,method,name){
    memo[name] = function(){
      var opt = _.find(arguments, _.isPlainObject) || {};

      var newArgs = [_.merge({json: true}, configOpt, opt, {
        url: baseUrl + (_.isString(arguments[0]) ? arguments[0] : opt.url)
      })];

      return method.apply(memo, newArgs);
    };
    return memo;
  }, {});

  return _.extend(self, httpMethods);
};
