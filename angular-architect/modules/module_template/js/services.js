'use strict';
/* Factory sample * /
angular.module('@@module_name@@').factory('replaceMyName', [ "logFactory", function( logFactory) {
     var log = logFactory('factory');
	 return {
        test : function (){
			log.debug('test');
		}
    };
}]);
/**/

/* Service sample * /
angular.module('@@module_name@@').service("replaceMyName", [ "logFactory", function( logFactory){
	var log = logFactory('service');
	
	return {
		test : function (){
			log.debug('test');
		}
	};

}]);
/**/