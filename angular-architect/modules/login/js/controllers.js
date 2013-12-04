angular.module('login').controller('loginCtrl', ['$scope', '$rootScope', '$http', '$route', '$routeParams', '$location', '$cookies', 'commons', 'logFactory','authentication',
    function ($scope, $rootScope, $http, $route, $routeParams, $location, $cookies, commons, logFactory, authentication) {
		var log = logFactory('loginCtrl');
		log.debug('Login Controller');
		//$scope.commons = commons.get();
		
		$scope.backUrl = $cookies.backUrl;
		
		$scope.user = { "username":"", "password":"", "remember":false};
		
		$scope.doLogin = function(){
			log.debug("Tentativo di login....");
			//startSpinner();
			authentication.login( $scope.user.username, $scope.user.password , $scope.user.remember);
			//authentication.login( $cookies[cookie.authorization.name] );
		};
	
	}
]);