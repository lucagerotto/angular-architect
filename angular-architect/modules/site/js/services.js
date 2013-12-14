'use strict';
/* Factory sample * /
angular.module('site').factory('replaceMyName', [ "logFactory", function( logFactory) {
     var log = logFactory('factory');
	 return {
        test : function (){
			log.debug('test');
		}
    };
}]);
/**/

/* Service sample * /
angular.module('site').service("replaceMyName", [ "logFactory", function( logFactory){
	var log = logFactory('service');
	
	return {
		test : function (){
			log.debug('test');
		}
	};

}]);
/**/