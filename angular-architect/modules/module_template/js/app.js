'use strict';
/* Togliere lo spazio tra l'asterisco e lo slash per attivare i blocchi di codice commentati */
angular.module('@@module_name@@',['_','widgets']);

/* Contants sample * /
angular.module('@@module_name@@').value("constants", {
	VERSION : "1.0"	
});
/**/

/* Module routing, only providers will be injected */
angular.module('@@module_name@@').config(['$routeProvider',function($routeProvider){
	var modulePath = getModulePath('@@module_name@@'); 
	$routeProvider.when( '/@@module_url@@' , {templateUrl: modulePath +'@@module_name@@/partials/dashboard.html', controller: '@@module_name@@_dashboardCtrl' , context:'@@module_name@@' , resolve: adminCtrl.resolve});
	//redirige alla home del modulo qualsiasi url non previsto per il modulo stesso
	$routeProvider.when( '/@@module_url@@/:other' , {redirectTo: '/@@module_url@@' });
}]);

/* Startup initialization sample * /
angular.module('@@module_name@@').run( ['$rootScope', 'logFactory', function($rootScope,logFactory){	
	var log = logFactory('run');
	log.debug('run @@module_name@@');
	//TODO write me
}]);
/**/