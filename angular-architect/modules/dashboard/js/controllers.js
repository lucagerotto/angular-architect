/**
 * Dashboard
 */
angular.module('dashboard').controller('dashboardCtrl',['commons', 'logFactory', function(commons, logFactory) {
	var log = logFactory('dashboardCtrl');
	log.debug('Dashboard Controller');
}]);