angular.module('core').service("authentication", ["$q","$rootScope", "$cookies", "$http", "$location", "logFactory", "commons", "notice",
                                               function($q, $rootScope, $cookies, $http, $location, logFactory, commons, notice){	
	var log = logFactory('authentication');
	//var user = $rootScope.user || {};
		
	var logout = function(){				
		log.debug("logout...");
		//startSpinner();
		//$rootScope.user = {}; //user;		
		//$rootScope.loggedUser = false;
		commons.set("loggedUser", false);
		commons.set("user",{});
		
		removeCookie(cookie.authorization.name, cookie.authorization.domain, cookie.authorization.path);
		delete $cookies[cookie.authorization.name];
		delete $cookies[cookie.backUrl.name];		
		
		$location.path( path.login );		
		if(!$rootScope.$$phase) {			
			$rootScope.$apply();
		}
	};
	
	function addNotice( collection , type ){
		type = type.replace(/s$/, "");
		angular.forEach( collection , function( message, field ){	
			//angular.forEach( messages , function( message ){
				notice.add( type, message.type, [], undefined , message.message);
			//});
		});	
	};
	
	var removeCookie = function(name, domain, path) {
	     document.cookie = name + "=" + ( ( path ) ? ";path=" + path : "") + ( ( domain ) ? ";domain=" + domain : "" ) + ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
	};	
	var getCookie = function (c_name){
		var c_value = document.cookie;
		var c_start = c_value.indexOf(" " + c_name + "=");
		if (c_start == -1){
			c_start = c_value.indexOf(c_name + "=");
		}
		if (c_start == -1){
			c_value = null;
		}
		else{
			c_start = c_value.indexOf("=", c_start) + 1;
			var c_end = c_value.indexOf(";", c_start);
			if (c_end == -1){
				c_end = c_value.length;
			}
			c_value = unescape(c_value.substring(c_start,c_end));
		}
		return c_value;
	};
	var readAuthorizationCookie = function(){
		var name = cookie.authorization.name;
		var c = $cookies[cookie.authorization.name];
		if (angular.isUndefined(c)){
			c = getCookie(name);	
		}		
		return c;
	};
	
	var setCookie = function(name,value,domain,path,expire){
		document.cookie = encodeURI(name) +"=" + encodeURI(value) + ";expires=" + expire + ";domain="+domain+";path="+path;
	};
	
	var setServerCookie = function(value,remember){
		var expire = new Date();
		var expire = (remember) ? expire.setDate(expire.getDate() + (cookie.authorization.expire || 365)) : 0;
		setCookie( cookie.authorization.name ,value ,cookie.authorization.domain, cookie.authorization.path, expire);
	};
	
	var loginWithCookie = function( cookieValue ){
		var cookieTokens = cookieValue.split('*');		
		return login (undefined,undefined,false,cookieTokens[0],cookieTokens[1]);
	};
	
	var login = function( username, password, remember, idUtente, displayName ){
		log.debug("login...");
		startSpinner();
		notice.clear();
		$rootScope.notice = notice.get();		
		//var url = "http://connect.mondadori.it/doLogin";
		//alert('login');
	    var d = $q.defer();
		if (conf.authorizationEnvironment === conf.environments.test){
	    	
			return $http.get('modules/login/mocks/admin.json',{ timeout : TIMEOUT }).success(function(data, status, headers, config) {
				$cookies[ cookie.authorization.name ] = data.username;
			    //user = data;
				//commons.disableWaiterAll(); 				
				//alert('utente caricato con successo: '+data.username);
				
				//$rootScope.user = data;
				$cookies[ cookie.authorization.name ] = data.oldCookie.value;
	    		commons.set("user",data);
				commons.set("loggedUser", true);//$rootScope.loggedUser = true;
	    		d.resolve(true);
	    		log.debug('utente '+ data.username + ' logato con successo');
				//log.debug('utente risulta loggato?: '+ $rootScope.loggedUser);
				var urlRitorno = $cookies[ cookie.backUrl.name ];
				$location.path( (urlRitorno && urlRitorno!=path.login) ? urlRitorno : path.dashboard );
				if(!$rootScope.$$phase) {
					$rootScope.$apply();
				}
				stopSpinner();
			}).error(function(data, status, headers, config) {
				d.resolve(false);
				log.error('erorre in fase di login: '+ status);				
				logout();
				//commons.disableWaiterAll();
				stopSpinner();
			});
			
	    } else {
	    	var connect = conf.connect[conf.authorizationEnvironment];
	    	return $http.get( $rootScope.conf.server_name + $rootScope.conf.serverContext +'/connect/doLogin' ,{ 
	    		timeout : TIMEOUT ,
	    		params: { "username" : username, "password" : password, "remember" : remember ,"idUtente":idUtente,"displayName":displayName
	    			//, "crc": conf.connect.crc , "area": connect.area , "applicazione": connect.applicazione
	    		}
	    	}).success(function(data, status, headers, config) {
				//$cookies[ cookie.authorization.name ] = data.username;
	    		if (angular.isUndefined(data) || angular.isUndefined(data.errors)){
	    			notice.add( "error", "err_00000", [], undefined , "Si è verificato un problema in fase di login.");
	    			stopSpinner();
	    			d.resolve(false);
	    		} else {
		    		if (data.errors.length==0){
		    			var user = data.profile;
		    			user["username"] = data.profile.USERNAME;
		    			//user["password"] = password;		    			
		    			commons.set("user", user);//$rootScope.user =  data.profile;
			    		$cookies[ cookie.authorization.name ] = data.oldCookie.value;
			    		commons.set("loggedUser", true);//$rootScope.loggedUser = true;	    						
			    		
			    		//scrivo i cookie provenienti dal server
			    		setServerCookie(data.oldCookie.value, remember);
			    		
						log.debug('utente '+ user.username + ' logato con successo');
						
						var urlRitorno = $cookies[ cookie.backUrl.name ];
						$location.path( (urlRitorno && urlRitorno!=path.login) ? urlRitorno : path.dashboard );
						if(!$rootScope.$$phase) {
							$rootScope.$apply();
						}
						stopSpinner();	
						d.resolve(true);
		    		} else {	    		
			    		addNotice( data.errors , "errors");
			    		addNotice( data.warnings, "warnings");
			    	    $rootScope.notice = notice.get();
			    	    stopSpinner();
						d.resolve(false);						
		    		}
	    		}
			}).error(function(data, status, headers, config) {
				d.resolve(false);
				log.error('erorre in fase di login: '+ status);
				logout();
				stopSpinner();
			});	    	
	    }
	    return d.promise;
	};
	
	return {
		logout : logout,
		
		login : login,
		
		isUserLogged : function(){
			var d = $q.defer();
			var auth_cookie_value = readAuthorizationCookie();
			var loggedUser = (typeof auth_cookie_value !== "undefined") && (auth_cookie_value !== "") && auth_cookie_value!= null;
			log.debug('Cookie auth value = ' + auth_cookie_value);
			var currentPath = $location.path();	
			if ( !loggedUser ){
				commons.set("loggedUser", false);//$rootScope.loggedUser = false;
				if ( currentPath != path.login ){
					$cookies[cookie.backUrl.name] = currentPath;
					//alert('vai alla login: '+path.login+' da '+ currentPath);
					//d.resolve($rootScope.loggedUser);
					d.resolve(false);
					$location.path( path.login );
					if(!$rootScope.$$phase) {					
						$rootScope.$apply();
					}
					stopSpinner();
				} else {
					log.debug('Non sei loggato e stai accedendo alla login');
					d.resolve(false);
				}
			} else {
				var user = commons.get("user");
				//Utente logato log.debug($rootScope.user);				
				if ( (typeof user === "undefined") || (jQuery.isEmptyObject(user)) ){
					log.debug('manca utente ma ho il cookie faccio login con il cookie: ' + auth_cookie_value);
					$cookies[cookie.backUrl.name] = currentPath;					
					d.resolve(loginWithCookie( auth_cookie_value ));
				} else {
					//ho sia il cookie che l'utente
					commons.set("loggedUser", true);//$rootScope.loggedUser = true;
					delete $cookies[cookie.backUrl.name];
					log.debug('Utente loggato : ' + user.username);
					d.resolve(true);
					//se sono logato e sto cercando di accedere alla schermata di login rimando alla dshboard
					if ( currentPath == path.login ){
						$location.path( path.dashboard );
						if(!$rootScope.$$phase) {							
							$rootScope.$apply();
						}
					}
				}
			}
			return d.promise;
		}
	};
}]);

/**
 * Definizione del servizio comune, da iniettare dove serve, contiene variabili condivise tra scope e la funzione 
 * per il recupero delle url di routing lato server.
 * per recuperare una variabile in commons usare:   valore =  commons.get('nome')
 * per settare una variabile in commons usare: commons.set('nome', valore );
 * valore può essere una stringa un numero o un oggetto, anche json.
 * 
 * [BLOCCO DEPRECATO lo fa il resolve di adminController] per recuperare tutte le variabili in commons usare: commons.get()
 * questa funzione va introdotta come prima istruzione nei controller e direttive che vogliono usare le variabili
 * di commons nelle direttive di angular, esempio:  
 *  
 *    qualcuno fa : commons.set('miaVariabile', true);
 * 
 *    <div ng-controller="mioCtrl"><div ng-show="commons.miaVariabile">...</div></div>
 *   
 *   function mioCtrl( $scope , commons ){
 * 	    $scope.commons = commons.get();
 *   }
 * [FINE BLOCCO DEPRECATO]
 * 
 * Per recuperare le route lato server usare: commons.route('nome_route_lato_server', [par1,par2, ... ,parN])
 */
angular.module('core').service("commons",[ "$rootScope", "$http", "$compile", "logFactory", function ( $rootScope, $http, $compile, logFactory){
	   var log = logFactory('commons');
	   log.debug('service: commons');
	    var properties = { //editInfo:{ updateDate:null, author:null }, 
	                       //editStatus: {},	                        
	                       //modal : { html: "", functions:{} }
	                      // ,waiterAll:true
	                     };
	    
	    var contextFunctions = { };
	    
	    var translate = function ( id , parameters , language) {
	    	var findMessage = function(language){
	    		t = $rootScope.translations[ language ];
	    		for (var i in token) {
	    			if ( jQuery.trim( token[i] ).length > 0 ){
	    				t = t[token[i]];
	    			}
	    			if ( !angular.isDefined(t) ){
	    				break;
	    			}
	    		}
	    		return t;
	    	};
	    	
	    	var translated = "";            
	    	if (angular.isDefined(id) && angular.isDefined($rootScope.translations) &&  angular.isDefined($rootScope.translations[language]) ) {
	    		var token = id.split('.');
	    		var t = "";
	    		if ( token.length > 0 ){
		    		t = findMessage(  language );		    		
	    		    if (  !angular.isDefined(t)  && language !== conf.language ){
	    		    	t = findMessage(  conf.language );
	    		    }		    		
	    		}
    			
    			translated = t;//$rootScope.translations[id];
	            if ( angular.isDefined(translated) ) {
	            	if ( angular.isDefined(parameters) ) {
		            	for (var parameter in parameters) {
		            		if ( angular.isDefined(parameters[parameter]) ){
		            			translated = translated.replace( '%'+parameter, parameters[parameter] );
		            		} else{
		            			translated = translated.replace( '%'+parameter , "" );
		            		}
		            	}
	            	}
	            } else {
	            	translated = "";
	            }
	   		}
	    	return translated;
        };
	    
	    
	    return {	
	    	trans:function ( id , parameters) {
	    		return translate(id, parameters, properties.language);
            },
            
            get : function (property) {
            	//console.log('get '+ property);
            	//console.log(properties);                
            	if (typeof property==='undefined'){
            		return properties;
            	}else{
            		return properties[property];
               }
            },
            set:function (property, value) {  
            	//console.log('prop = '+property);
            	//console.log(value); 
            	if (typeof value === 'object'){ 
	            	var destination =  properties[property];
	            	if (typeof destination !== 'undefined'){
		            	for (var field in value) {
		            	//	console.log('field '+ field);
		            	//	console.log('value '+ value[field]);
				            destination[field] = value[field];
				        } 
			        }  
			        properties[property] = value;   
		        } else {
		        	if (angular.isUndefined(value) && angular.isObject(property) ){
		        		properties = property;
		        	}else if (property!='get' && property!='set' && property!='route' && property!='popup'&& property!='modal'){     	
               			properties[property] = value;
               		}
               	}
                //console.log('set '+ property + " => " + value);
                //console.log(properties);
            },
            addFn: function( name , fn ){
            	//console.log(contextFunctions[$rootScope.context]);
            	contextFunctions[$rootScope.context][name] = fn;
            },
            getFn: function( name ){
            	if (typeof $rootScope.context === 'undefined' || typeof contextFunctions[$rootScope.context] === 'undefined'){
            		return {};
            	}
            	if (angular.isDefined(name)){
            		return contextFunctions[$rootScope.context][name];
            	} else {
            		return contextFunctions[$rootScope.context];
            	}
            },
            clearContext: function () {
            	if ($rootScope.context!=undefined) {
            		contextFunctions[$rootScope.context] = {};
            	}
            },
            route:function(routeName, routeParams){
            	//console.log('route '+ routeName + " params: "+ routeParams);
            	var routeUrl = $rootScope.server.routes[routeName].url;            	
            	angular.forEach(routeParams, function(value, key){ routeUrl  += '/' +  encodeURIComponent(value);});
            	//if (angular.isArray(routeParams)){}
            	//angular.forEach(routeParams, function(value, key){
            	//	this = this.concat("/" + value); <-- non fa il left assignment maledetto!!!
            	//}, routeUrl );            	
            	//console.log(routeUrl);
            	return routeUrl; 
            },
            getAdminSiteUrl:function() {
            	//console.log( $rootScope.server.adminSite + " ---------- " +$rootScope.server.baseUrl);
            	return "http://"+$rootScope.server.adminSite+$rootScope.server.baseUrl;
            },
            getSiteUrl:function(siteUrl) {
            	return "http://"+siteUrl+$rootScope.server.baseUrl;
            }
//            ,
//		    enableWaiterAll: function(){
//		    	$rootScope.$broadcast('$enableWaiterAll');
//		    },
//		    disableWaiterAll: function(){
//		    	$rootScope.$broadcast('$disableWaiterAll');
//		    }
		    
        };   
}]);

angular.module('core').service("notice", [ "$rootScope", "$http", "$compile", "commons", "logFactory", function( $rootScope, $http, $compile,  commons, logFactory){
	var types = ['error','warning','success','info','debug','validation','log'];
	var initial ='{"error":{},"warning":{},"success":{},"info":{},"debug":{}, "validation":{},"log":{} }';
	var keepNotices = false;
	var notice = angular.fromJson(initial);
	
	return {
		set : function ( n , type ){
			if (angular.isDefined(type)){
				notice[type] = n;
			}else{
				notice = n;
			}
		},
		get : function( type ){
			if (angular.isDefined(type)){
				return notice[type];
			}else{
				return notice;
			}
		},
		keep : function( val ){
			keepNotices = (val===true);
		},
		clear : function( type ){
			if ( !keepNotices ){
				if (angular.isDefined(type)){
					notice[type] = [];
				} else {
					notice = angular.fromJson(initial);
				}
			}
		},
		add : function( type, code, args, field , originalMessage){
			if (!angular.isDefined(field)){
				field = "global";
			}			
			var message = commons.trans($rootScope.context+"."+type+"."+code,args);
			
			if (message === '' && angular.isDefined(originalMessage)){
				message = originalMessage;//se non ho la traduzione uso quella che arriva dal server
			}
			var x = notice[type][field];
			if (angular.isDefined(x)){
				notice[type][field].push(message);
			} else {
				notice[type][field] = [];
				notice[type][field].push(message);
			}
		}
	};

}]);

//-------------------------------------------------------------------------------------------------------------------
// FIXME DA RIVEDERE
//-------------------------------------------------------------------------------------------------------------------
/**
 * servizio per i modali, fa il popup generico, il popup con la domanda
 */
angular.module('core').service("modals", [ "$rootScope", "$http", "$compile", "logFactory","commons", function( $rootScope, $http, $compile, logFactory,commons){
	var log = logFactory('modals');
	log.debug('service: modals');
	
    var properties =  { confirm:{},functions:{},route:"",args:{},callback:"",data:"",message:"",shown:false};
    var set=function(property, value) {
    	if (typeof value === 'object'){ 
        	var destination =  properties[property];
        	if (typeof destination !== 'undefined'){
            	for (var field in value) {
		            destination[field] = value[field];
		        } 
	        }  
	        properties[property] = value;   
        }else{
  			properties[property] = value;
       	}
    };
    
    var close = function(){
    	set('shown',false);
    };
    var open = function(){
    	set('shown',true);
    };
    
    var dispatch = function (fn, args) {
    	fn = (typeof fn == "function") ? fn : window[fn];  // Allow fn to be a function object or the name of a global function
        return fn.apply(this, args || []);  // args is optional, use an empty array by default
    };
    
    var makePopup = function( title, titleArgs, message, messageArgs, onClickFunction, onClickFunctionArgs, template) {
		if (angular.isDefined(title) && title !==null){
			set('title', commons.trans( title , titleArgs));
		}
		if (angular.isDefined(message) && message !==null){
			set('message', commons.trans( message , messageArgs) );
		}
		set('confirm',  onClickFunction);    	
		set('args',  onClickFunctionArgs );
		if (angular.isUndefined(template)){
			template = "_/partials/confirmForm.html";    			
		}
		set('template',  template );    		
		set('data', "<div data-ng-include=\"'"+ template +"'\"></div>");		
		set('close',close);
		set('shown',true);
    };
    
    return {	
    	get:function (property) {
        	if (typeof property==='undefined'){
        		return properties;
        	}else{
        		return properties[property];
           }
        },
        set:function (property, value) {  
        	set(property, value);
        },
        close: function(){
        	close();
        },
        open: function(){
        	open();
        },              
//        popupSymfony:function(url, args, method){
//        	//funzione assolutamente deprecata ma ancora usata qua e là
//		       $http({
//					method : angular.isDefined(method) ?  method : "GET",
//					url : url,
//					data : jQuery.param( args ),
//					headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
//			    }).success(function(data) {	
//			    	set('data', data);
//		    		set('shown',true);
//		           	$rootScope.$broadcast('$disableWaiterAll'); // TODO correggere con disableWaiterAll
//				});
//	    },
    	popupForm:function(html,route,args,callback) {
    		set("route",route);
    		set("args",args);
    		set("callback",callback);
    		set('data', "<div ng-include=\"'"+html+"'\"></div>");
    		set('close',close);
    		set('shown',true);
        },
        confirmForm:function( message, messageArgs, onClickFunction, onClickFunctionArgs, template) {
        	makePopup(null,null, message, messageArgs, onClickFunction, onClickFunctionArgs, template);
        },
        alertForm:function(title,titleArgs,message, messageArgs,template) {
        	makePopup(title,titleArgs, message, messageArgs, null,null, template);
        },
        popup:function( title, titleArgs, message, messageArgs, onClickFunction, onClickFunctionArgs, template) {
        	makePopup( title, titleArgs, message, messageArgs, onClickFunction, onClickFunctionArgs, template);
        }        
    };
}]);

/*
angular.module('core').factory('requestNotificationChannel', ['$rootScope', function($rootScope){
	// private notification messages
	var _START_REQUEST_ = '_START_REQUEST_';
	var _END_REQUEST_ = '_END_REQUEST_';

	// publish start request notification
	var requestStarted = function() {
	    $rootScope.$broadcast(_START_REQUEST_);
	};
	// publish end request notification
	var requestEnded = function() {
	    $rootScope.$broadcast(_END_REQUEST_);
	};
	// subscribe to start request notification
	var onRequestStarted = function($scope, handler){
	    $scope.$on(_START_REQUEST_, function(event){
	        handler();
	    });
	};
	// subscribe to end request notification
	var onRequestEnded = function($scope, handler){
	    $scope.$on(_END_REQUEST_, function(event){
	        handler();
	    });
	};

	return {
	    requestStarted:  requestStarted,
	    requestEnded: requestEnded,
	    onRequestStarted: onRequestStarted,
	    onRequestEnded: onRequestEnded
	};
}]);
*/