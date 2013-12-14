'use strict';
angular.module('site').controller('site_dashboardCtrl',['$scope','$rootScope', '$routeParams','$cookies','$browser','$location','$http','$resource', '$domUtilityService','commons', 'logFactory', 'resource', function($scope,$rootScope,$routeParams,$cookies,$browser,$location, $http,$resource,$domUtilityService, commons, logFactory,resource) {
	var log = logFactory('site_dashboardCtrl');
	log.debug('site_dashboardCtrl');
}]);
