/**
 * Dashboard
 */
angular.module('dashboard').controller('dashboardCtrl',['$scope','$rootScope', '$http','$resource','commons', 'logFactory', function($scope,$rootScope, $http,$resource, commons, logFactory) {
	var log = logFactory('dashboardCtrl');
	log.debug('Dashboard Controller');
	
	var sitePath = getModulePath('site');
	var dashboardPath = getModulePath('dashboard');
	
	$scope.dashboardTemplate = ((sitePath=='') ? dashboardPath+'dashboard' : sitePath+'site')+'/partials/dashboard.html';

}]);