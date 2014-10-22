/**
 * main app level module
 */
define(function (require) {
  var angular = require('angular');
  var _ = require('lodash');
  var $ = require('jquery');
  var modules = require('modules');
  var routes = require('routes');

  require('elasticsearch');
  require('angular-route');
  require('angular-bindonce');

  // Seems bad?
  window.ZeroClipboard = require('zeroclipboard');
  require('ng-clip');

  var configFile = JSON.parse(require('text!config'));

  var kibana = modules.get('kibana', [
    // list external requirements here
    'elasticsearch',
    'pasvaz.bindonce',
    'ngRoute',
    'ngClipboard'
  ]);

  configFile.elasticsearch = (window.location.protocol + '//' + window.location.hostname + '/elasticsearch/');

  kibana
    // This stores the Kibana revision number, @REV@ is replaced by grunt.
    .constant('kbnVersion', window.KIBANA_VERSION)
    // The build number is placed by grunt, represents a sequence to provide nothing really but order.
    .constant('buildNum', window.KIBANA_BUILD_NUM)
    // This stores the build number, @REV@ is replaced by grunt.
    .constant('commitSha', window.KIBANA_COMMIT_SHA)
    // Use this for cache busting partials
    .constant('cacheBust', window.KIBANA_COMMIT_SHA)
    // The minimum Elasticsearch version required to run Kibana
    .constant('minimumElasticsearchVersion', '1.4.0.Beta1')
    // When we need to identify the current session of the app, ef shard preference
    .constant('sessionId', Date.now())
    // attach the route manager's known routes
    .config(routes.config)
    .config(['ngClipProvider', function (ngClipProvider) {
      ngClipProvider.setPath('bower_components/zeroclipboard/dist/ZeroClipboard.swf');
    }]);

  // setup routes
  routes
    .otherwise({
      redirectTo: '/' + configFile.defaultAppId
    });

  // tell the modules util to add it's modules as requirements for kibana
  modules.link(kibana);

  kibana.load = _.onceWithCb(function (cb) {
    require([
      'controllers/kibana'
    ], function loadApps() {
      require(configFile.plugins, cb);
    });
  });

  kibana.init = _.onceWithCb(function (cb) {
    kibana.load(function () {
      $(function () {
        angular
          .bootstrap(document, ['kibana'])
          .invoke(function () {
            $(document.body).children(':not(style-compile)').show();
            cb();
          });
      });
    });
  });

  return kibana;
});
