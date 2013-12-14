'use strict';
/* Togliere lo spazio tra l'asterisco e lo slash per attivare i blocchi di codice commentati */
angular.module('site',['core']);

/* Contants sample * /
angular.module('site').value("constants", {
	VERSION : "1.0"	
});
/**/

/* Module routing, only providers will be injected */
angular.module('site').config(['$routeProvider',function($routeProvider){
	var modulePath = getModulePath('site'); 
	$routeProvider.when( '/site' , {templateUrl: modulePath +'site/partials/dashboard.html', controller: 'site_dashboardCtrl' , context:'site' , resolve: adminCtrl.resolve});
	//redirige alla home del modulo qualsiasi url non previsto per il modulo stesso
	$routeProvider.when( '/site/:other' , {redirectTo: '/site' });
}]);

/* Startup initialization sample * /
angular.module('site').run( ['$rootScope', 'logFactory', function($rootScope,logFactory){	
	var log = logFactory('run');
	log.debug('run site');
	//TODO write me
}]);
/**/