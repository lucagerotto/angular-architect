angular.module('login').controller('loginCtrl', ['$scope', '$rootScope', '$http', '$route', '$routeParams', '$location', '$cookies', 'commons', 'logFactory','authentication',
    function ($scope, $rootScope, $http, $route, $routeParams, $location, $cookies, commons, logFactory, authentication) {
		var log = logFactory('loginCtrl');
		log.debug('Login Controller');
		//$scope.commons = commons.get();
		
		var sitePath = getModulePath('site');
		var loginPath = getModulePath('login');
		
		$scope.loginFormTemplate = ((sitePath=='') ? loginPath+'login' : sitePath+'site')+'/partials/loginForm.html';
		
		$scope.backUrl = $cookies.backUrl;
		
		$scope.user = { "username":"", "password":"", "remember":false};
		
		$scope.doLogin = function(){
			log.debug("Tentativo di login....");
			authentication.login( $scope.user.username, $scope.user.password , $scope.user.remember).then(function(path){
				if (path!=null){
					$location.path(path);	
				}				
			});
		};
	
	}
]);