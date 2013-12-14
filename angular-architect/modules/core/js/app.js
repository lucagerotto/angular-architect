'use strict';
/**
 * Definizione principale di angular: crea il rootScope 
 */
angular.module('ngRoute',[]);//commentare quando sarà stabile la versione >=1.2 di angular
angular.module('ngAnimate',[]);//commentare quando sarà stabile la versione >=1.2 di angular
angular.module('core' ,['ngRoute','ngCookies','ngResource','ngAnimate','bootstrapPrettify'] ).config(['$interpolateProvider','$locationProvider','$httpProvider',function($interpolateProvider,$locationProvider,$httpProvider){
    //$interpolateProvider.startSymbol('{[{').endSymbol('}]}'); //sovraccarica l'operatore di accesso alle espressioni con {[{ }]} per compatibilità con twig
	//$locationProvider.html5Mode(true);
	//$locationProvider.hashPrefix('!');
}]);

/**
 * Definizione delle costanti globali per angular
 */
angular.module('core').value("constants", {
	VERSION: "1.0"
});

/** esempio di regola /error|warn|.*Ctrl/ */
angular.module('core').value('DEBUG',0).value('LOG',0).value('INFO',1).value('WARNING',2).value('ERROR',3);
angular.module('core').factory('logFactory',['$rootScope','$log', function ($rootScope, $log) {
	return function (prefix) {
		
		var extracted = function (prop, logLevel) {
			return function(){	
				try{
					var _logLevel = $rootScope.conf.log.level;				
					var _logWhiteList = new RegExp($rootScope.conf.log.whiteList,"ig");
					
					var match =  _logWhiteList ? _logWhiteList.test( prefix ) : true;
					//console.log('logLevel: '+ logLevel + "     root level: "+_logLevel);
					if ( match && ( (!angular.isDefined(_logLevel)) || (logLevel >= _logLevel) ) ) {
					
						var args = [].slice.call(arguments);
						if (prefix) {
							args.unshift('[' + prefix + ']');
						}
						$log[prop].apply($log, args);	
					} else {
						return angular.noop;
					}
				} catch(exception) {
					return angular.noop;
				}
			};
		};
		
		return {
			debug : extracted( 'log'   , 0 ),			
			log   : extracted( 'log'   , 0 ),
			info  : extracted( 'info'  , 1 ),
			warn  : extracted( 'warn'  , 2 ),
			error : extracted( 'error' , 3 )
		};
	};                                                     
}]);

/**
 * Inizializzazione dell'applicazione.
 * utilizza la variabile globale: conf
 */
angular.module('core').run(['$compile','$rootScope','$routeParams', '$location', '$q', '$http', '$window', '$cookies', 'constants', 'commons', 'modals', 'logFactory', 'authentication', function($compile,$rootScope, $routeParams, $location, $q, $http, $window, $cookies, constants, commons, modals, logFactory, authentication) {
	$rootScope.conf = conf;
	var log = logFactory('run');
	log.debug('run');
	
	$rootScope.$on("$routeChangeStart", function (event, next, current) {
        authentication.isUserLogged().then(function( path ){
        	if ( path != null ) {
                $location.path( path );
            }	
        });		
    });
	
//	Attiva lo spinner finché ci sono  richieste http pendenti 
	$rootScope.pendingRequests = $http.pendingRequests;
	$rootScope.$watch( 'pendingRequests.length', function( newValue, oldValue ){
		if (angular.element('#requestSpinner').children().length==0){
			angular.element('#requestSpinner').append($rootScope.requestSpinner.el);
		}		
		if (newValue !== oldValue ){
			/*
			console.log(newValue);
			if( newValue >0){
				showSpinner(0.4);			
			} else {
				hideSpinner();
			}
			*/
		}
	});
	
	//-------------------------------------------------------------
	// Di default non ho un utente loggati all'avvio
	//-------------------------------------------------------------	
	//$rootScope.loggedUser = false;
	//$rootScope.user = {};
	commons.set("loggedUser", false);
	commons.set("user",{});
	//authentication.isUserLogged();
	//-------------------------------------------------------------
	// Gestisco la lingua 
	//-------------------------------------------------------------	
	var language = conf.language;
	var settingsCookie = $cookies[cookie.settings.name];
	if (angular.isDefined( settingsCookie ) ){
		settingsCookie = angular.fromJson(settingsCookie);
		if (angular.isDefined(settingsCookie.language ) ){
			language = settingsCookie.language;
		}
	}
	commons.set("language", language );	
	log.debug('language: '+ commons.get("language") );
	
	$rootScope.modals = modals.get();//per avere le variabili angular da utilizzare in pagina nelle espressioni o direttive
	$rootScope.commons = commons.get();//questo serve per poter utilizzare nelle espressioni le variabili del servizio
	$rootScope.$watch('commons', function (newVal, oldVal) { if (newVal!=oldVal){ commons.set($rootScope.commons); }});
	
	$rootScope.constants = constants;//per avere le variabili angular da utilizzare in pagina nelle espressioni o direttive
	
	//commons.set('waiterAll', true);  //se true mostra la rotella di attesa
	$rootScope.server     = { routes: null , baseUrl: null, adminSite: null}; //conterrà le route lato server caricate nel resolve di adminCtrl
	$rootScope.reloadNavigator=true; //se false non ricarica il navigatore
	
	//-------------------------------------------------------------
	//Gestione chiusura/apertura navigatore di secondo livello al cambio di contesto
	//-------------------------------------------------------------   
	$rootScope.$watch('context', function (newVal, oldVal) { if (newVal!=oldVal && $rootScope.reloadNavigator){ 
		closetClose(); 
	}});//TODO: verificare se possimo spostare la chiusura del closet nel resolve...se viene cambiato il contesto si chiude il navigatore.
	//$rootScope.$on('$navigatorContentLoaded', closetOpen );	
	
	//-------------------------------------------------------------
	//Gestione ridimensionamenti finestra del browser
	//-------------------------------------------------------------
    var _window = angular.element($window);
    _window.bind('resize', function () { 
    	if(!$rootScope.$$phase) {
    		$rootScope.$apply(); 
    	}
    });
 
	$rootScope.getWindowDimensions = function () { return { 'h': _window.height(), 'w': _window.width() }; };
	
	//Ridimensiona l'altezza della sidebar se cambia  l'altezza della finestra
	$rootScope.$watch($rootScope.getWindowDimensions, function (newValue, oldValue) {
		$rootScope.windowHeight = newValue.h;
		$rootScope.windowWidth = newValue.w;
		updateNavigatorScrolls(newValue.w, newValue.h);
	}, true);
	//Ridimensiona l'altezza della sidebar se cambia  il contenuto del div centrale
	$rootScope.$on('$viewContentLoaded', function ( event, currentRoute, previousRoute ) {	
		updateNavigatorScrolls($rootScope.windowWidth, $rootScope.windowHeight);
	});
	//Ridimensiona l'altezza della sidebar se viene caricato il navigatore nella sidebar
	$rootScope.$on('$navigatorContentLoaded', function ( event, currentRoute, previousRoute ) {	
		closetOpen();
		updateNavigatorScrolls($rootScope.windowWidth, $rootScope.windowHeight);
	});	
	
	//-------------------------------------------------------------
	//Gestione ridimensionamenti div centrale
	//-------------------------------------------------------------    
	var _toolbars = angular.element('#toolbars');
	$rootScope.getToolbarsDimensions = function () { return { 'h': _toolbars.height(), 'w': _toolbars.width() }; };
	
	//Ridimensiona il contenuto se cambia il numero di toolbar (o la loro altezza) o la dimensione dello schermo	
	$rootScope.$watch($rootScope.getToolbarsDimensions, function (newValue, oldValue) {
		updateContentHeight($rootScope.windowWidth, $rootScope.windowHeight);    
	}, true);
	
	
	
	$rootScope.$on('toolbarLoaded',function(){
		updateContentHeight($rootScope.windowWidth, $rootScope.windowHeight);
	});
	
	
	
	//-------------------------------------------------------------	
	//Funzioni di utilità non definite in questa versione di angular
	//-------------------------------------------------------------
	 $rootScope.isEmpty = function (obj) {
	       return angular.equals({},obj); 
	 };
	 
	//$rootScope.$on('$navigatorContentLoaded', function(event,args){	if ($rootScope.context!=args.context){ closetOpen();} });
	//$rootScope.$on('$routeChangeSuccess', function (scope, next, current) {jQuery("body").scrollLeft(''+jQuery('.jazz-admin-sidebar').width()/2)});
		
/*	
	// register listener to watch route changes
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
      if ( $rootScope.loggedUser == null ) {
        // no logged user, we should be going to #login
        if ( next.templateUrl == "partials/login.html" ) {
          // already going to #login, no redirect needed
        } else {
          // not going to #login, we should redirect now
          $location.path( "/login" );
        }
      }         
    });
   
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
	    if($rootScope.xxx == undefined) {
    		   $location.path('/login');
	            $rootScope.xxx = true;
	        } 
	});
*/	
	 $rootScope.requestSpinner = new Spinner({
			lines: 9, // The number of lines to draw
			length: 3, // The length of each line
			width: 2, // The line thickness
			radius: 4, // The radius of the inner circle
			corners: 1, // Corner roundness (0..1)
			rotate: 0, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: '#fff', // #rgb or #rrggbb
			speed: 1.5, // Rounds per second
			trail: 40, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: false, // Whether to use hardware acceleration
			className: 'spinner-small', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: 'auto', // Top position relative to parent in px
			left: 'auto' // Left position relative to parent in px		 
        }).spin();
}]);


/** /
angular.module('core').config(['$httpProvider', function ($httpProvider) {
    var $http,
    interceptor = ['$q', '$injector', function ($q, $injector) {
        var notificationChannel;

        function success(response) {
            // get $http via $injector because of circular dependency problem
            $http = $http || $injector.get('$http');
            // don't send notification until all requests are complete
            if ($http.pendingRequests.length < 1) {
                // get requestNotificationChannel via $injector because of circular dependency problem
                notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
                // send a notification requests are complete
                notificationChannel.requestEnded();
            }
            return response;
        }

        function error(response) {
            // get $http via $injector because of circular dependency problem
            $http = $http || $injector.get('$http');
            // don't send notification until all requests are complete
            if ($http.pendingRequests.length < 1) {
                // get requestNotificationChannel via $injector because of circular dependency problem
                notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
                // send a notification requests are complete
                notificationChannel.requestEnded();
            }
            return $q.reject(response);
        }

        return function (promise) {
            // get requestNotificationChannel via $injector because of circular dependency problem
            notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
            // send a notification requests are complete
            notificationChannel.requestStarted();
            return promise.then(success, error);
        }
    }];

    $httpProvider.responseInterceptors.push(interceptor);
}]);
/**/