/**
 * controller di amministrazione agganciato al body
 */
//app.controller('adminCtrl',['$scope','$rootScope', 'commons', 'logFactory', 'authentication', function($scope,$rootScope, commons, logFactory, authentication) {
var adminCtrl = function ($anchorScroll,$scope,$rootScope, $location, commons, logFactory, authentication) {	
	var log = logFactory('adminCtrl');
	log.debug ('Admin Controller');
	
	$scope.logout = function() {		
		log.debug("l'utente " + $scope.commons.user + " sta per uscire...");
		authentication.logout().then(function( path ){
        	if ( path != null ) {
                $location.path( path );
            }	
        });
	};
	
	$scope.goTo = function( path ){
		if (angular.isDefined(path)){
			path = path.replace(/^#/,'');
		}
		$location.path(path);
	};
	
	//http://www.w3.org/html/wg/drafts/html/master/browsers.html#the-indicated-part-of-the-document
	$scope.scrollTo = function(id) {
		$location.hash( id );
	    $anchorScroll();
	};
	
};
//}]);
adminCtrl.$inject = ['$anchorScroll','$scope','$rootScope', '$location', 'commons', 'logFactory', 'authentication'];
/**
 * carica le route di symfony: invocato nel resolve del routing di angular per ogni bundle
 */
adminCtrl.resolve = {
	
	routes: ['$rootScope', '$cookies', '$location', '$http', '$q', '$route', '$routeParams', 'commons', 'logFactory', 'authentication','notice', 'constants',function($rootScope, $cookies, $location, $http, $q, $route, $routeParams, commons, logFactory, authentication, notice, constants) {
		var log = logFactory('adminCtrl:resolve');
		log.debug('resolve '+ $location.path() );
		$rootScope.commons = commons.get();
		$rootScope.constants = constants;
		notice.clear();
		$rootScope.notice = notice.get();
		if ($route.current.context != $rootScope.context){
			//svuotiamo array precedente
			commons.clearContext();
			$rootScope.context = $route.current.context;		
			//partiamo con array vuoto
			commons.clearContext();
		}	

		$rootScope.commonsFn = commons.getFn();
		commons.set('currentPath',$location.path());
		
		$rootScope.modulePath = getModulePath( $rootScope.context );

		var loadRouteParams = $q.defer();
		loadRouteParams.resolve($route);
		
		var loadGlobalData = $q.defer(); 
	    if ($rootScope.conf.initUrl !== null){
		    if ($rootScope.server.routes==null){
		    	if ($location.path()!=path.login){
			    	log.debug('Devo caricare le routes');
				    $http({
			    		url    : $rootScope.conf.serverContext + $rootScope.conf.initUrl, 
			    		method : "GET"
			    	}).success( function(data, status, headers, config) { 
			        	$rootScope.server.routes = data.routes.routes;
			        	//console.log($rootScope.server.routes);
			      		$rootScope.server.baseUrl = data.routes.baseUrl;
			      		$rootScope.server.adminSite = data.routes.adminSite;	      		
			      		commons.set('status', data.status);
			      		//alert('global');
			      		loadGlobalData.resolve(data.routes);  
			    	}).error(function(data, status, headers, config) {
			    		log.error('errore eseguendo '+initUrl+ " "+status);
			    		loadGlobalData.reject(); // you could optionally pass error data here
					});
		    	} else {
					log.debug('Non carico le routes');
					loadGlobalData.resolve($rootScope.server.routes);
				}		    
			} else {
				log.debug('Ho già caricato le routes');
				loadGlobalData.resolve($rootScope.server.routes);
			}
	    } else {
	    	log.debug('Non ho routes lato server da caricare');
	    	loadGlobalData.resolve();
	    }
	    
	    return $q.all([ loadRouteParams.promise, loadGlobalData.promise , authentication.isUserLogged() ]).then( function( res ){
				if (res[2]!=null){
					 if(res[2] != path.login){
		            	 var _routeParams = res.shift();
	            	 if ($rootScope.reloadNavigator){
	            		 $rootScope.$broadcast('$navigatorChangeNeeded', angular.fromJson( _routeParams.current.pathParams ) );//carica il navigatore di secondo livello
	            	 }
	            	 $rootScope.reloadNavigator = true;
	}
					  $location.path( res[2] );
				}
	    });
	}]
/*	Scommentare se si vuole introdurre un ritardo nella partenza della route di angular * /
	, delay : [ '$q','$timeout', function($q, $timeout) {
	    var delay = $q.defer();
	    $timeout(delay.resolve);
	    return delay.promise;
	}]
/**/
};