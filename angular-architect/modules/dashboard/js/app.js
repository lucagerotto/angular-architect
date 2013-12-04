/**
 * Modulo Dashboard
 */
angular.module('dashboard',['core']);

/**
 * Configurazione di base. Si possono iniettare solo costanti e provider
 */
angular.module('dashboard').config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	var modulePath = getModulePath('dashboard'); 
	$routeProvider.when( path.dashboard , {templateUrl: modulePath + 'dashboard/partials/dashboard.html', controller: 'dashboardCtrl' , context:'dashboard' , resolve: adminCtrl.resolve});
    $routeProvider.otherwise({redirectTo: path.dashboard});
}]);