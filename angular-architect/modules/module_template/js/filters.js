'use strict';
/* Filter  sample * /
angular.module('@@module_name@@').filter('replaceMyName', ["logFactory", function( logFactory) {
	  var log = logFactory('filter');
	  return function(value){
		var args = [].slice.call(arguments);	
		log.debug(args);
	}
}]);
/**/
