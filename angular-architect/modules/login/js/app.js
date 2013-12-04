angular.module('login',['core']).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	var modulePath = getModulePath('dashboard'); 
	$routeProvider.when( path.login , {templateUrl: modulePath + "login/partials/login.html", controller: 'loginCtrl', context:'login' , resolve: adminCtrl.resolve});
	$routeProvider.otherwise({redirectTo: path.login});
}]);

/** /
angular.module('login').run( function(){
	//TODO write me
});
/**/