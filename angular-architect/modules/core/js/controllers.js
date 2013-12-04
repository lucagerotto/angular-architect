/**
 * controller di amministrazione agganciato al body
 */
//app.controller('adminCtrl',['$scope','$rootScope', 'commons', 'logFactory', 'authentication', function($scope,$rootScope, commons, logFactory, authentication) {
var adminCtrl = function ($anchorScroll,$scope,$rootScope, $location, commons, logFactory, authentication) {	
	var log = logFactory('adminCtrl');
	log.debug ('Admin Controller');
	
	$scope.logout = function() {		
		log.debug("l'utente " + $scope.commons.user + " sta per uscire...");
		authentication.logout();
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
/* Spostato in function.js	
		var loadContextTranslations = function( ctx, lng , $http, $q){
	    	var res = {};
	    	var deferred = $q.defer();
	    	$http.get( ctx +'/translations/messages.'+ lng +'.json').success(function(data, status, headers, config) {	    		
	    		//log.debug('ho caricato le traduzioni di '+ ctx +' per la lingua '+ lng);
	    		res = data;
	    		deferred.resolve( res );  
	  		}).error(function(data, status, headers, config) {
	  			if (lng!==conf.language){
	  				log.warn('Mancano i messaggi internazionalizzati del contesto '+ ctx +' per la lingua '+ lng);	  				
	  				$http.get( ctx +'/translations/messages.'+ conf.language +'.json').success(function(data, status, headers, config) {	    		
	  		    		res = data;
	  		    		log.warn('Utilizzo i messaggi internazionalizzati del contesto '+ ctx +' per la lingua di default: '+conf.language);
	  		    		deferred.resolve( res );  
	  		  		}).error(function(data, status, headers, config) {
	  		  		    log.error('Mancano i messaggi internazionalizzati del contesto '+ ctx +' per la lingua di default: '+conf.language);
	  		  			deferred.reject(); 
	  				});
	  			} else {
	  				log.error('errore caricando i messaggi internazionalizzati del contesto '+ ctx +' per la lingua '+ lng);
	  				deferred.reject(); 
	  			}
			});
	    	return deferred.promise;
	    }			
*/
		// see: https://groups.google.com/forum/?fromgroups=#!topic/angular/DGf7yyD4Oc4
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
/* Spostato in function.js    
	    //Load internazionalization messages
	    var loadTranslations = $q.defer();
	    var language = commons.get("language");
	    if ($rootScope.translations==null || $rootScope.translations[language]==null){	
	    	if ($rootScope.translations==null){ $rootScope.translations = {}; }
	    	if ($rootScope.translations[language]==null){ $rootScope.translations[language] = {}; }		    
	    	log.debug('Carico i messaggi internazionalizzati per la lingua  '+ language);		    
		    loadTranslations.resolve(
				    loadContextTranslations("_", language, $http,$q).then( function( result ){
				    	$rootScope.translations[language] = result;	
				    	return loadContextTranslations( $route.current.context , language, $http, $q).then(
				    			function(r){
				    				//log.debug( "Carico le traduzioni per il contesto... "+ $route.current.context );	
			    					if ( (typeof r !== "undefined") && (!jQuery.isEmptyObject(r) ) ){						
			    						$rootScope.translations[language][$route.current.context] = r[$route.current.context];
						    	    }
			    					//alert('translations');
						    	    return r;
			    				}
				    		);
				    })	    
		    );		   
	    } else {			
	    	log.debug('Ho già caricato le traduzioni principali');
	    	if ($rootScope.translations[language][$route.current.context]==null){
	    		 loadTranslations.resolve(
		    		loadContextTranslations( $route.current.context , language, $http, $q).then(
	    				 function(result){
	    					 if ( (typeof result !== "undefined") && (!jQuery.isEmptyObject(result) ) ){						
	    			    		 $rootScope.translations[language][$route.current.context] = result[$route.current.context];
	    			    	 }
	    					 return $rootScope.translations;
	    				 }
		    		)
	    		 );
	    	}else{
	    		loadTranslations.resolve($rootScope.translations);	
	    	}
		}
*/	 
	    
/* Spostato in function.js  
	    var loadMenu = $q.defer();
	    if ($rootScope.menu==null){
		    log.debug('Carico le funzioni del menu');
		    $http.get('_/config/menu.json').success(function(data, status, headers, config) {
		    	$rootScope.menu = data;
		    	//alert('menu');
		    	loadMenu.resolve(data);
	  		}).error(function(data, status, headers, config) {
	    		log.error('errore caricando le funzioni del menu');
	    		loadMenu.reject();  
			});
	    } else {
			log.debug('Ho già caricato le funzioni del menu');
			loadMenu.resolve($rootScope.menu);
		}
*/	    
	   
	    
/* Spostato in function.js
	    var loadConnectconfiguration = $q.defer();
	    if ($rootScope.connect==null){
		    log.debug('Carico configurazione del connect');
		    $http.get('_/config/connect.json').success(function(data, status, headers, config) {
		    	log.debug('Ambiente: '+ data[conf.authorizationEnvironment]);
		    	$rootScope.connect = data[conf.authorizationEnvironment];
		    	//alert('conf');
		    	loadConnectconfiguration.resolve(data[conf.authorizationEnvironment]);
	  		}).error(function(data, status, headers, config) {
	    		log.error('errore caricando la configurazione del connect');
	    		loadConnectconfiguration.reject();
			});
	    } else {
			log.debug('Ho già caricato la configurazione del connect');
			loadConnectconfiguration.resolve($rootScope.connect);
		}
*/	    
/* Spostato in functions.js
 		var loadResources = $http.get( $route.current.context +'/config/resources.json');
	    loadResources.success(function(data, status, headers, config) {
	    	 log.debug('Carico le risorse per il contesto : '+ $route.current.context);
	    	 if ( (typeof data !== "undefined") && (!jQuery.isEmptyObject(data) ) ){
	    		 log.debug(data);
	    		 for (var resource in data) {
	    			 log.debug( $route.current.context + data[resource] );
	    			 loadResource( $route.current.context + data[resource] );
	    		 }
	    		 //alert('resources');
	    	 }
  		}).error(function(data, status, headers, config) {
    		log.error('errore caricando le risorse per il contesto : '+ $route.current.context);
		});
*/	    
	    return $q.all([ loadRouteParams.promise, loadGlobalData.promise , authentication.isUserLogged()/*, loadTranslations.promise */ /*, loadMenu.promise */ /*, loadConnectconfiguration.promise */ /*, loadResources */])
	             .then( function( res ){
	            	//authentication.isUserLogged();
	            	 var _routeParams = res.shift();//{};//res.pathParams;//;
//	            	 console.log(_routeParams);
//	            	 console.log(_routeParams.pathParams);
//	            	 console.log(_routeParams.current.pathParams);
//	            	 angular.forEach(  res.shift() , function(value,key){
//	            		 _routeParams[key] = value;
//	            	 } );
//	            	 
//	            	 log.debug(_routeParams);
	            	 if ($rootScope.reloadNavigator){
	            		 $rootScope.$broadcast('$navigatorChangeNeeded', angular.fromJson( _routeParams.current.pathParams ) );//carica il navigatore di secondo livello
	            	 }
	            	 $rootScope.reloadNavigator = true;
	             });//.then( removeExtraResources() );
	}
/*	Scommentare se si vuole introdurre un ritardo nella partenza della route di angular * /
	, delay: function($q, $timeout) {
	    var delay = $q.defer();
	    $timeout(delay.resolve, 3000);
	    return delay.promise;
	}
//*/
	]
};