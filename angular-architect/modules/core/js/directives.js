/**
 * Blocca la propagazione dell'evento
 */
angular.module('core').directive('stopEvent', ['logFactory',function (logFactory) {
	var log = logFactory('stopEvent');
	return {
        restrict:'A',
        link:function (scope, element, attrs) {        	
            element.bind(attrs.stopEvent, function (e) {
            	e.stopPropagation();
            });
        }
    };
}]);

/**
 * back button
 * /
angular.module('core').directive('backButton', ['$route','$window','logFactory','commons',function ($route,$window,logFactory,commons) {
	var log = logFactory('backButton');
	return {
        restrict:'A',
        link:function (scope, element, attrs) {
        	element.on('click', function() {
        		//var lastPath = commons.get('lastPath');
        		//if (attrs.backButton === lastPath){
        		//	commons.set('backMode',true);
        		//	$window.history.back();	
            	//} else {
            		$location.path(attrs.backButton);
            	//}                
            });
        }
    };
}]);
/**/
/**
 * Direttiva per mandare a capo un testo spezzandolo su una lunghezza e con un numero di righe massimo.
 * Il testo verrà centrato verticalmente sul contenitore
 * definire gli attributi text, length e rows(default 3)
 */
angular.module('core').directive('splitlineCentervertical', [ function() {
	return {
		restrict: 'A',
		scope: {
			text   : '@',
			length : '@',
			rows   : '@'
		},	
		link: function (scope, element, attrs){
			var text = scope.text;
			var rowText = [ text ];	
			
			if (angular.isDefined(scope.length)){
				if (angular.isUndefined(scope.rows)){
					scope.rows = 3;
				}
				text = splitLine( scope.text, scope.length );
				var rowText = text.split("\n");

				if (rowText.length > scope.rows) {
					rowText = rowText.slice(0, scope.rows);
					text = rowText.join('<br \/>');
					text += "...";
				} else {
					text = rowText.join('<br \/>');
				}		
			}	
			element.html( text );			
			var parentHeight = element.parent().height();			
			var elementHeight = element.height(); 
			var fontSize = 0;
			try{
				fontSize = parseInt(element.css('line-height').replace(/px/,''));			
				if (fontSize === 0){ fontSize = parseInt(element.css('font-size').replace(/px/,'')); }
			} catch( exception ){
				fontSize = 0;
			}
			if ((elementHeight/fontSize) > rowText.length ){
				elementHeight = rowText.length * fontSize;
			}			
			var padding  = Math.round( (parentHeight - elementHeight )/2);			

			if (padding != null){
				element.css('padding',padding+'px 0px');				
			}
		}
	};	
	
}]);
/**
 * Gestisce il pulsante collapse della sidebar e lo stato in un cookie di settings.collapse
 */
angular.module('core').directive('jazzSidebarMenu', ['$rootScope','$cookies', '$browser','commons', 'logFactory', function($rootScope,$cookies,$browser,commons, logFactory) {
	var log = logFactory('jazzSidebarMenu');
	
	return {
		restrict: 'A',		
		controller:  ['$scope', '$element', '$attrs', '$transclude', function($scope, $element, $attrs, $transclude) {		
			
			$scope.updateSettingsCookie = function ( collapse ){
				var c = collapse;
				if (typeof c === 'undefined' || c === null){
					c = false;
				}
				var settings = $cookies[cookie.settings.name];
				if (typeof settings === 'undefined' || settings === null){
					collapsed = c;
					settings = {};		
				} else {//esiste il cookie
		            try{
		            	settings = angular.fromJson(settings);
		            	collapsed = settings['collapsed']; 
						if (typeof collapsed === 'undefined' || collapsed === null){
							collapsed = c;
						} else { 
							if (typeof collapse !== 'undefined' && collapse !== null){
								collapsed = collapse;							
							}				
						}
		            } catch(exception){         	
		            	collapsed = c;
		            }
				}
				settings['collapsed'] = collapsed;
				$cookies[cookie.settings.name] = angular.toJson(settings);
				$browser.cookies(cookie.settings.name, $cookies[cookie.settings.name]);//devo persistere i poveri biscotti
				return collapsed;
			};
			
			
			$scope.collapseClose = function() {
				jQuery('.jazz-admin.jazz-admin-sidebar .navbar').switchClass('navbar-fixed-side','navbar-fixed-side-collapsed',
						{    duration : 500, 
					     easing   : 'swing',						
						 complete : function(){
							 if(!$scope.$$phase) {
								 $scope.$apply(function(){							 
								   $rootScope.$broadcast('$changeSideBarCollapse', {collapse:true});
							     });
							 } else {
								 $rootScope.$broadcast('$changeSideBarCollapse', {collapse:true});							     
							 }
					     }
					}
				);
				
			    jQuery('.extra-collapse').addClass('extra-collapse-collapsed').find('.icon-chevron-left').removeClass('icon-chevron-left').addClass('icon-chevron-right');
				jQuery('.jazz-admin .sidebar-closet').switchClass('sidebar-closet-closed','sidebar-closet-collapsed',500);
				$scope.updateSettingsCookie( true );
			};

			$scope.collapseOpen = function() {
				jQuery('.jazz-admin .sidebar-closet').switchClass('sidebar-closet-collapsed','sidebar-closet-closed',500);
			    jQuery('.jazz-admin.jazz-admin-sidebar .navbar').switchClass('navbar-fixed-side-collapsed','navbar-fixed-side',
						{    duration : 500, 
						     easing   : 'swing',						
							 complete : function(){
								 if(!$scope.$$phase) {	
									 $scope.$apply(function(){
							    		$rootScope.$broadcast('$changeSideBarCollapse', {collapse:false});
							         });
								 } else {
									 $rootScope.$broadcast('$changeSideBarCollapse', {collapse:false});
								 }
						     }
				        }
			    );
				
				
			    jQuery('.extra-collapse').removeClass('extra-collapse-collapsed').find('.icon-chevron-right').removeClass('icon-chevron-right').addClass('icon-chevron-left');
			    $scope.updateSettingsCookie( false );
			};
			
			$scope.isClosetClosed = function(){
				return jQuery('.jazz-admin .sidebar-closet').hasClass('sidebar-closet-closed');
			};
			
		}],
	    link: function( scope, element, attr ) {	    	
	    	if (scope.$last){//è un ng-repeat
	    		var collapse =  scope.updateSettingsCookie();	
	    		if (collapse ){
	    			scope.collapseClose();
	    		}else{
	    			scope.collapseOpen();
	    		}			
	    		//jQuery('.jazz-admin .navbar-fixed-side').height(jQuery(document).height());
	    		jQuery('.jazz-admin.jazz-admin-sidebar .navbar').height(jQuery(document).height());
	    		jQuery('.jazz-admin .sidebar-main-main a').click(function() {
	    			if (jQuery(this).parent().hasClass('sidebar-disabled')){
	    				closetClose();
	    		    	return false;
	    		    } else {
	    		        if ( jQuery(this).closest('li').hasClass('active') && scope.isClosetClosed() ){
	    		        	if (!jQuery(this).closest('li').hasClass('no-closet')) { closetOpen(); }
	    		        	return false;
	    		        } else if (!scope.isClosetClosed() ) {
	    		        	closetClose();
	    		        }
	    		        scope.collapseOpen();
	    	    	}
	    		});
	    		
	    		jQuery('.extra-collapse a').click(function() {
	    			if(jQuery(this).closest('li').hasClass('extra-collapse-collapsed')){
	    				scope.collapseOpen();
	    			} else {
	    				scope.collapseClose();
	    			}
	    			return false;
	    		});    		
	    		
	    	}
	    }
    };
}]);

/* * /
angular.module('core').directive('toolbar', ['$rootScope', '$routeParams','$route','$http','$q', '$anchorScroll', '$location', '$compile','$templateCache', 'commons', 'logFactory', function($rootScope,$routeParams, $route, $http, $q, $anchorScroll, $location, $compile, $templateCache, commons, logFactory) {
	var log = logFactory('toolbar');
	
	return {
	    restrict: 'A',
	    terminal: false,
	    link: function(scope, element, attr) {
	    	//$viewContentLoaded
	    	scope.$on('$routeChangeSuccess', function(event, args){
	    		alert('ecco');
	    		element.contents().remove();
	    		
	    		var standardToolBar = $q.defer();
	    		var routeToolBar = $q.defer();
	    		$http({ 
    				url : '/'+ $rootScope.context +"/partials/toolbars/standard.html",
    				params: $routeParams,
    				method: "GET"
    			}).success(function(data, status, headers, config) { 
    				alert('1');
    				element.append( data ); 
    				return standardToolBar.resolve();
    			}).error(function(data, status, headers, config){ 
    				return standardToolBar.resolve(); 
		    	});
    			
    			$http({ 
					url : $rootScope.context+"/partials/toolbars"+$location.path()+".html",
	    			params: $routeParams,
	    			method: "GET"
	    		}).success(function(data, status, headers, config) {
	    			alert('2');
	    		    element.append( data );	    
	    		    return routeToolBar.resolve(); 
		    	}).error(function(data, status, headers, config){ 
		    		return routeToolBar.resolve(); 
		    	});
    			
    			$q.all([standardToolBar.promise,routeToolBar.promise]).then(function(response){
    				
    				$compile(element)(scope);
    				if(!scope.$$phase) {scope.apply();}
    			});
	    		
	    	});
	    }
	}
}]);
//*/

/**
 * Accende l'item se il suo href corrisponde alla route corrente 
 */
angular.module('core').directive('navItem', ['$rootScope', '$routeParams','$route','$http', '$anchorScroll', '$location', '$compile','$templateCache', 'commons', 'logFactory', 
                                          function($rootScope,$routeParams, $route, $http, $anchorScroll, $location, $compile, $templateCache, commons, logFactory) {
	var log = logFactory('navItem');
	
	return {
		restrict:'A',
		scope:{},		   
//		controller:  ['$scope', '$element', '$attrs', '$transclude', function($scope, $element, $attrs, $transclude) { }],
		link: function(scope, element, attrs, controller) {
            scope.commons = commons.get();
			var clazz = attrs.activeLink;
            if (!angular.isDefined(clazz)){
            	clazz = "active";
            }
            var path = attrs.href;
            if (angular.isDefined(path)){
            	path = path.replace(/^#/,"");
            	//path = path.substring(1); //hack because path does bot return including hashbang
            }
            scope.path = $location.path(); 
            scope.$watch('path', function(newPath) {
                if (path === newPath) {
                    element.addClass(clazz);
                    scope.selected = true;
                } else {
                    element.removeClass(clazz);
                    scope.selected = false;
                }
            });
		}  
	};
}]);
/**
 * Gestisce il navigatore caricandolo in base alla configurazione e nel caso sia necessario.
 * Emette l'evento $navigatorContentLoaded al caricamento.
 * Ascolta l'evento $navigatorChangeNeeded per fare l'update del navigatore (rilanciato dal resolve principale)
 */
angular.module('core').directive('navigator', ['$q','$rootScope', '$routeParams','$route','$http', '$anchorScroll', '$location', '$compile','$templateCache', 'commons', 'logFactory', 
                                            function($q, $rootScope,$routeParams, $route, $http, $anchorScroll, $location, $compile, $templateCache, commons, logFactory) {
	return {
	    restrict: 'ECA',
	    terminal: false,
	    controller:[ '$scope', function($scope){
	    	$scope.setReloadNavigator= function( reload , newItem){
	    		$rootScope.reloadNavigator= reload;
	    		$rootScope.$broadcast("changeActiveItem", newItem);
	    	};
	    	
	    	$scope.isDraggableNavigatorItem = function(topPage){
	    		if (angular.isDefined(topPage) && angular.isDefined(topPage.navigatorModeParams)){
	    			if(topPage.navigatorModeParams == null || (angular.isUndefined(topPage.navigatorModeParams.limit) || topPage.navigatorModeParams.limit == 0)){
	    				return true;
	    			}
	    		} 
	    		return false;
	    	};
	    }],
	    //scope:{},	   
	    link: function(scope, element, attr) {
	    	var log = logFactory('navigator');	    	
	    	
	    	var lastScope;//, onloadExp = attr.onload || '';
		      
			function destroyLastScope() {
			    if (lastScope) {			    
			    	log.debug('destroyLastScope');
			      lastScope.$destroy();
			      lastScope = null;
			    }
			}
			
			function findNav( tokens, bcs ){
				var d = $q.defer();					
				if (angular.isDefined($route.current.nav)){
					$http.get( $route.current.nav ).success( function(data){
					    d.resolve( { "data":data , "bcs":bcs });
					    return;
				    }).error( function(data){
				    	d.reject( { "data":null , "bcs":null });
				    });
				} else{
					recursive( tokens, bcs, d);
				}
				return d.promise;
			}
			
			function recursive( tokens, bcs , d){								
				$http.get( $rootScope.modulePath + $rootScope.context +"/partials/navs/"+ tokens.join('_') +".html" ).success( function(data){
				    d.resolve( { "data":data , "bcs":bcs });
				    return;
			    }).error( function(data){
			    	if ( tokens.length == 0 ){
			    		d.reject( { "data":null , "bcs":null });
			    		return;
			    	}else{
			    		recursive( tokens.slice(0,-1), bcs.slice(0,-1) , d);
			    	}		    	
		    	});				
			}			
			
			function insertTemplate( template , routeParams ){
				commons.set("routeParams", routeParams);
				log.debug('navigatore caricato');
				var path = $location.path();//path corrente
				var tokens = path.split('/');//token del path corrente
				var bcs = [];//strutture delel breadcrumbs da ritornare
				
				if (angular.isDefined(tokens) && tokens.length>1){
					tokens.shift();					
					var token = null;
					var bcd = $rootScope.context +".breadcrumbs.";
					var bcu = "";
					var bc =  null;
					for (var i in tokens){
						bc =  {};
						token = tokens[i];
						bcu = bcu +"/"+ token;	
						bc["description"] = bcd + bcu;
						bc["url"] = "#" +bcu;
						bcs.push(bc);
					}
				}	
				destroyLastScope();
			    lastScope = scope.$new();				    
			    
			   var breadcrumbsTemplate = $route.current.breadcrumbs;
				if (angular.isUndefined(breadcrumbsTemplate)){
					breadcrumbsTemplate = '_/partials/breadcrumbs.html';
				}
				lastScope.breadcrumbsTemplate = breadcrumbsTemplate;				

			    return findNav( tokens, bcs ).then(function(res){
			    	element.html(template);					   
				    if( angular.isDefined(res) && res.bcs!=null ){
					    lastScope.bcs = res.bcs;
					    element.find('.innerNav').html(res.data);
				    }
				    $compile(element.contents())( lastScope );
					$rootScope.$broadcast('$navigatorContentLoaded', {context:$rootScope.context, type:"internal"});
					//scroll to:  .sidebar-socks-entry-sel
					$anchorScroll();
			   });
			}
			
			/**
			 * Usato se si effettua la chiamata lato server
			 */
			function createTemplate( data,navTemplate ){
				destroyLastScope();
				lastScope = scope.$new();
				lastScope.data = data.data;				
				
				return $http.get( navTemplate ).then( function(response){						
					element.html( response.data );	
					//FIXME rendere il sortable esterno					
					
					var navigatorPageId = null;
					if (angular.isDefined(data.data) && angular.isDefined(data.data.topPage) && data.data.topPage.hasChildren){
						navigatorPageId = data.data.topPage.id;
					} else if(angular.isDefined(data.data.parentPage)) {
						navigatorPageId = data.data.parentPage.id;
					}
					
					lastScope.sortableConfig = {
						    forcePlaceHolderSize:false,
							scope:'navigator',
						    axis:'y',
							scroll: true,
							cursor:'move',
							scrollSpeed:0, 
							handle:'.drag-handle',
							items:'.item', 
							start: function(event, ui) {
								lastScope.sortableConfig.cancel = false;	
								ui.item.addClass('sidebar-socks-entries-drag');	
							},
							stop: function(event, ui) {							    
							    ui.item.removeClass('sidebar-socks-entries-drag');							
							    lastScope.sortableConfig.disabled = true;
							    var error = true;
							    var slugs = [];
							    angular.forEach( lastScope.data.pages , function(value, key){
							    	slugs.push( value.slug );
							    }, slugs);	
//console.log(slugs.join());						    
							    
							    $http({
						            url: $rootScope.conf.server_name + $rootScope.conf.serverContext +'/admin/pages/changeOrder/',
						            method: "POST",
						            data: {pageId: navigatorPageId, children: slugs.join()},
						            cache:false,
						            timeout: TIMEOUT						           
						        }).then(function(res){
						        	error = res.data.error;
						        	if (error.length>0){
						        		lastScope.sortableConfig.cancel = true;
						        	}
						        	lastScope.sortableConfig.disabled = false;
						        });    
							}
					};
					$compile(element.contents())( lastScope );
					$rootScope.$broadcast('$navigatorContentLoaded', {context:$rootScope.context, type:"external"});					
					$anchorScroll();
				});
			}
			
			function getContextMenu(){
				var menu = null;
				var tokenUrl=$location.path().split("/")[1];

				//cerco tra i moduli una voce del menù che abbia lo stesso contesto - e che abbia l'url che inizia 
				//con la stessa parolina delle url del modulo
				for( var index in $rootScope.menu){
					
					if ($rootScope.menu[index].context === $rootScope.context && ($rootScope.menu[index].url===undefined || $rootScope.menu[index].url.split("/")[1]==tokenUrl)){
						menu = $rootScope.menu[index]; 
						menu.selected=true;
					} else {
						$rootScope.menu[index].selected=false;
					}
				}
				return menu;
			}
			
			function loadNavigator(event, args){				
					log.debug('loadNavigator');
					startSpinner();
					element.html("");//svuota il navigatore precedente			    
					var menu = getContextMenu();
					if (angular.isDefined(menu) && menu!=null){
						var closet = menu.closet;
						if (typeof closet !== 'undefined'){
							var navTemplate = "_/partials/nav.html";//navigatore con breadcrumbs e inclusione del sottomenu
							if (typeof closet.template !== 'undefined'){			
								navTemplate = $rootScope.modulePath + $rootScope.context + closet.template;
							}						
							if (typeof closet.url !== 'undefined'){								
								//menu esterno									
								var url = closet.url;
								if (closet.url.indexOf("/") == 0){
									var url = $rootScope.conf.server_name + $rootScope.conf.serverContext + closet.url;																		
								}
								$rootScope.$broadcast('$navigatorContentLoading', {context:$rootScope.context, type:"external", url:url});
								$http({ 
									url : url,
									params: args,
									method: "GET", 
									cache:false
								}).success(function(data, status, headers, config) {								
									createTemplate(data,navTemplate);
									/*.then(function(){
										$location.hash(args.pageId);
										$anchorScroll();
									});	*/								    
								}).error(function(data, status, headers, config) {					
									log.error('errore in loadNavigator: '+ status);
									//$scope.status = status;
								}).then(function(response) { stopSpinner(); });									
							} else if ( closet !== false ){								
									//menu interno			
									var template = $http.get( navTemplate/*, {cache: $templateCache}*/).
				                      then(function(response) { insertTemplate( response.data , args).then(function(response) { stopSpinner(); }); });							    
							} else { stopSpinner(); }
						} else { stopSpinner(); }
					} else {
						log.error('Non esiste il menu per il contesto: '+ $rootScope.context);
						stopSpinner();
					}
			}
			scope.$on('$navigatorChangeNeeded', loadNavigator );      
	    }
    };
}]);

/**
 * direttive per l'edit della pagina
 */
angular.module('core').directive('angularHtmlBind', ['$compile',function($compile) {
	return {
		scope:{},
		link: function(scope, elm, attrs) {		
	        scope.$watch(attrs.angularHtmlBind, function(newValue, oldValue) {
	            if (newValue && newValue !== oldValue) {
	                elm.html(newValue);
	                $compile(elm.contents())(scope);
	            }
	        });
	    }
    };
}]);

/* NON VIENE USATA * /
angular.module('core').directive('postRender',['commons', function(commons) {
	return {
		restrict : 'A', 
	    terminal : true,
	    transclude : true,
	    scope:{},
	    link : function(scope, element, attrs) {
	        commons.disableWaiterAll();
	    }
    };
}]);
/**/

/**
 * Serve per bindare un input ad un'altro, esempio di utilizzo: 
 * <input id="form_title" ng-model="form.title" />
 * <input id="form_slug" jazz-input-bind="form.title|slugify" />
 */
angular.module('core').directive('jazzInputBind',[function(){
	return { 
		scope:{},
		restrict: 'ECA',	    
		link: function(scope, element, attr) {
				element.addClass('ng-binding').data('$binding', attr.jazzInputBind);
				scope.$watch(attr.jazzInputBind, function(newValue, oldValue){
					if ( newValue!== oldValue ){
						element.val( angular.isDefined(newValue) ? newValue : '');
					}
				});
  		}
  	};
}]);

/**
 * Spezza il contenuto di un elemento in 2 o 3 righe se supera una certa lunghezza.
 * esempio di utilizzo: <div><span jazz-split-line="5">Questo è il testo molto lungo</span></div>
 * Notate che l'elemento deve avere un padre... anche body in caso :D
 * /
angular.module('core').directive('jazzSplitLine',[ '$compile', 'logFactory', function($compile, logFactory){
	return {
		scope:{},
		restrict: 'A',
		link: function (scope, element, attr){
			var log = logFactory('jazzSplitLine');
			
			var lens = attr.jazzSplitLine.split(':');
			var numRows = 3;
			if (angular.isArray(lens)){ 
				if (lens.length>1){ numRows = lens[1];}
			}			
			var len = Number(lens[0]);
			//var text = element.text();
			scope.$eval(element.contents());
			//$compile( element.contents() )( scope );
			//console.log(element);
			var text = element.text();
			if (text.length > numRows*len){ text = truncate (text, numRows*len); }			
			text = split( text , len, '<br/>');
			element.html( text );
			var parentHeight = element.parent().height();
			var elementHeight = element.height();
			var padding  = Math.round((parentHeight - elementHeight)/2);			
			//if (text.length > 2*len ) {	
			//	padding = Math.round((parentHeight - (elementHeight*3))/2);				
			//} else if ( text.length > len && text.length <= 2*len ){
			//	padding = Math.round((parentHeight - (elementHeight*2))/2);
			//}
			if (padding!=null){
				element.css('padding',padding+'px 0px');				
			}
		}
	};
}]);
*/
/**
 * Spezza il contenuto di un elemento in 2 o 3 righe se supera una certa lunghezza ma senza break.
 * esempio di utilizzo: <div><span jazz-split-line-nobreak="5">Questo è il testo molto lungo</span></div>
 * Notate che l'elemento deve avere un padre... anche body in caso :D
 * /
angular.module('core').directive('jazzSplitLineNobreak',[function(){
	return {
		scope:{},
		restrict: 'A',
		link: function (scope, element, attr){
			
			
			var lens = attr.jazzSplitLineNobreak.split(':');
			var numRows = 3;
			if (angular.isArray(lens)){ 
				if (lens.length>1){ numRows = lens[1];}
			}			
			var len = Number(lens[0]);
			//$compile( element.contents() )( scope.$new() );			
			var myText = splitLine(element.text(),len);
			var myHTML = myText.replace(/\n/g,'<br \/>'); 

			element.html( myHTML );
			var parentHeight = element.parent().height();
			var elementHeight = element.height();
			var padding  = Math.round((parentHeight - elementHeight)/2);			
			//if (text.length > 2*len ) {	
			//	padding = Math.round((parentHeight - (elementHeight*3))/2);				
			//} else if ( text.length > len && text.length <= 2*len ){
			//	padding = Math.round((parentHeight - (elementHeight*2))/2);
			//}
			if (padding!=null){
				element.css('padding',padding+'px 0px');				
			}
		}
	};
}]);
*/

/**
 * Tronca e allinea verticalmente il contenuto di un elemento in 2 o 3 righe se supera una certa lunghezza.
 * esempio di utilizzo: <div><span jazz-truncate="5">Questo è il testo molto lungo</span></div>
 * Notate che l'elemento deve avere un padre... anche body in caso :D
 */
angular.module('core').directive('jazzTruncate',[function(){
	return {
		//scope:{},
		restrict: 'A',
		link: function (scope, elem, attr){
			var lens = attr.jazzTruncate.split(':');
			var numRows = 3;
			if (angular.isArray(lens)){ 
				if (lens.length>1){ numRows = lens[1];}
			}			
			var len = Number(lens[0]);
			angular.element('innerNav').find("li a").each(function(i,element){
				var myHTML =  truncate($(element).text(),len);
				element.html( myHTML );
				var parentHeight = $(element).parent().height();
				var elementHeight = $(element).height();
				var padding  = Math.round((parentHeight - elementHeight)/2);			
//				if (text.length > 2*len ) {	
//					padding = Math.round((parentHeight - (elementHeight*3))/2);				
//				} else if ( text.length > len && text.length <= 2*len ){
//					padding = Math.round((parentHeight - (elementHeight*2))/2);
//				}	
				if (padding!=null){
					$(element).css('padding',padding+'px 0px');				
				}
				
			});
			
		}
	};
}]);
/* NON VIENE USATA * /
angular.module('core').directive('waiterAll', ['commons',function(commons) {
	return {
		scope:{},
	    restrict: 'A',
	    terminal: false,
	    link: function(scope, element, attr) {
	    	function enable(event,args){	
			   	commons.set('waiterAll',true);			   	
			   	jQuery(element).show();			   	
			}
			
			function disable(event,args){	
			   	commons.set('waiterAll',false);			   	
			   	jQuery(element).hide();
			}
	    	
		    scope.$on('$enableWaiterAll', enable);		     
		    scope.$on('$disableWaiterAll', disable);      
	    }
    };
}]);
/**/

angular.module('core').directive('ngFocus', ['$parse', function($parse) {
    return function(scope, element, attr) {
        var fn = $parse(attr['ngFocus']);
        element.on('focus', function(event) {
            scope.$apply(function() {
                fn(scope, {$event:event});
            });
        });
    };
}]);

angular.module('core').directive('ngBlur', ['$parse', function($parse) {
    return function(scope, element, attr) {
        var fn = $parse(attr['ngBlur']);
        element.on('blur', function(event) {
            scope.$apply(function() {
                fn(scope, {$event:event});
            });
        });
    };
}]);

/**
 * Come ngView ma gestisce anche l'iframe 
 */
angular.module('core').directive('iframeView', ['$location','$rootScope', '$http', '$templateCache', '$route', '$anchorScroll', '$compile', '$controller', 'logFactory','commons',
                                   function($location,$rootScope, $http, $templateCache, $route, $anchorScroll,   $compile, $controller, logFactory, commons) {
	return {
      restrict: 'ECA',
      terminal: true,
      link: function(scope, element, attr, controllers) {
        var log = logFactory('iframeView');
    	var lastScope, onloadExp = attr.onload || '';
    	
    	//addatta la larghezza dell'iframe in base allo stato della sidebar (collapsed/no-collapsed)
    	scope.$on('$changeSideBarCollapse', function (event ,args) {	
    		var sidebarWidth = jQuery('.jazz-admin.jazz-admin-sidebar').width(); //larghezza sidebar    		    
    		jQuery('.iframeView').width( $rootScope.windowWidth - sidebarWidth );    		    
    	});
    	//quando cambia la route aggiorno il contenuto centrale
        scope.$on('$routeChangeSuccess', update);        
        scope.$on('$routeChangeError', error);
        scope.$on('$routeChangeStart', changeRoute );
        //update();
        
        scope.updateToolbarHeight = function(){
        	scope.$emit('toolbarLoaded');
        }
        
        window.iframeLoaded = function (){
        	$rootScope.$broadcast('iframeViewContentLoaded');
        	compileIframeView();
        };        
        
        function compileIframeView(){    	
        	var element = jQuery(frames[0].document).find('body').addClass('iframeView'); 
        	compileTemplate( element, true );        	
        	angular.element(element).children('#arnoldo-container').eq(0).find('a').css('cursor','default').click(function(e){e.preventDefault();});
        	
	    }        
	    
        function destroyLastScope() {
          if (lastScope) {
            lastScope.$destroy();
            lastScope = null;
          }
        }

        function clearContent() {
          element.html('');
          destroyLastScope();
        }  
        
        function changeRoute(){        	
        	startSpinner();        	
        	clearContent();
	    }	    
        
        function interpolate(string, params) {
            var result = [];
            angular.forEach( (string||'').split(':'), function(segment, i) {
              if (i == 0) {
                result.push(segment);
              } else {
                var segmentMatch = segment.match(/(\w+)(.*)/);
                var key = segmentMatch[1];
                result.push(params[key]);
                result.push(segmentMatch[2] || '');
                delete params[key];
              }
            });
            return result.join('');
        }
        
        
        function getIframeTemplate( url ){
        	return beforTemplate() +'<iframe id="content-body" class="iframeView" onLoad="iframeLoaded();" src="'+ url +'" width="100%" height="'+ $rootScope.windowHeight+'" frameborder="0" allowfullscreen></iframe>'+ afterTemplate();
        }
        
        function beforTemplate(){
        	return '<div class="jazz-admin" ><div id="content-container" class="container-fluid"><div id="toolbars" class="row-fluid"><div data-ng-include="\''+$rootScope.modulePath + $rootScope.context +'/partials/toolbars/global.html\'"></div></div>';
        }
        function afterTemplate(){		
        	return '</div></div>';
        }
        
        
        function compileTemplate( element, isIframe ){
        	 var locals = $route.current && $route.current.locals,        	
        	     link = $compile(element.contents()),
                 current = $route.current,
                 controller;

	         lastScope = current.scope = scope.$new();
	         if (isIframe){
		         var toolbars = angular.element('#toolbars');
	         	 if (toolbars.contents().length > 0){
	         		$compile(toolbars.contents())(lastScope);
	         	 } 
	         }
	         if (current.controller) {
	           locals.$scope = lastScope;
	           controller = $controller(current.controller, locals);
	           element.children().data('$ngControllerController', controller);
	         }
	
	         link(lastScope);
	         lastScope.$emit('$viewContentLoaded');
	         //lastScope.$broadcast('$viewContentLoaded');
	         lastScope.$eval(onloadExp);
	
	         $anchorScroll();
	         if (isIframe){ 
	        	 $rootScope.$apply(); 
	         }	         
	         stopSpinner();
        }
        
        function error(){        
        	var templateNotFound = commons.get('templateNotFound');
        	var templateError = '<div class="cloak jazz-admin"><div class="container-fluid"><div id="content-body" class="row-fluid"><div class="padding-lateral">'+	
        		'<div><h1>'+ commons.trans( '_.templateError.title' ) +'</h1><p>'+ commons.trans( '_.templateError.message' , [templateNotFound || "undefined"])  +'</p></div>'+
        		'</div></div></div></div>';        			
        	
        	if (angular.isUndefined()){
        	    templateNotFound = templateError;
        	    element.html(templateError);
            	stopSpinner();
        	} else {
            	$http.get( templateNotFound ).then(function(result){
            		if ( angular.isDefined(result) ){
            			templateError = result;
            		}
            		element.html(templateError);
                	stopSpinner();
                });
             }        	
        }
        
        function update() {
        	var locals = $route.current && $route.current.locals,
                template = locals && locals.$template;
        	
        	destroyLastScope();
			if ($route.current.iframeUrl){
				  var url = interpolate($route.current.iframeUrl, $route.current.params); 
				  element.html( getIframeTemplate( url ) );
			} else {
	          if ( template ) {     
	        	  if ($route.current.iframe){
	        		  element.html( getIframeTemplate( $route.current.templateUrl ) );
	        	  } else { 
	        		  element.html(template);	        		 
	                  compileTemplate( element, false ); 
	        	  }
	          } else {
	            clearContent();
	            stopSpinner();
	          }
	        }        
        }//update function
        
      }
    };
}]);
 
angular.module('core').directive('validation',['$parse','$q','$sniffer','$rootScope','notice','resource', 
                                            function($parse,$q,$sniffer,$rootScope, notice,resource) {
	return {
		//scope:{}, //mai fare uno scope isolato su un elemento con validazione!!!
		require: ['ngModel','?^form','?^bindResource'],
	    restrict: 'A',
	    terminal: false,
	    link: function(scope, element, attrs, ctrls) {
	    	var modelCtrl = ctrls[0];
	    	var formCtrl = ctrls[1] || nullFormCtrl;
	    	var bindResourceCtrl = ctrls[2] || {};
	    	var name = attrs.name;	    	
	    	
	    	function trim(value) {
	    		  return angular.isString(value) ? value.replace(/^\s*/, '').replace(/\s*$/, '') : value;
	    	}
	    	
	    	var validationType = 'validation';
	    	var validationMode = attrs.validation;	    	
	    	if (angular.isDefined(validationMode) && validationMode!== "" ){
	    		//immediate validation
	    		
/*	    		
	    		  var validateFn, watch, validators = {}, validateExpr = scope.$eval(validationMode);

	    	      if (!validateExpr){ return;}

	    	      if (angular.isString(validateExpr)) {
	    	        validateExpr = { validator: validateExpr };
	    	      }

	    	      angular.forEach(validateExpr, function (exprssn, key) {
	    	        validateFn = function (valueToValidate) {
	    	          var expression = scope.$eval(exprssn, { '$value' : valueToValidate });
	    	          if (angular.isObject(expression) && angular.isFunction(expression.then)) {
	    	            // expression is a promise
	    	            expression.then(function(){
	    	              ctrl.$setValidity(key, true);
	    	            }, function(){
	    	              ctrl.$setValidity(key, false);
	    	            });
	    	            return valueToValidate;
	    	          } else if (expression) {
	    	            // expression is true
	    	            ctrl.$setValidity(key, true);
	    	            return valueToValidate;
	    	          } else {
	    	            // expression is false
	    	            ctrl.$setValidity(key, false);
	    	            return undefined;
	    	          }
	    	        };
	    	        validators[key] = validateFn;
	    	        ctrl.$formatters.push(validateFn);
	    	        ctrl.$parsers.push(validateFn);
	    	      });

	    	      // Support for ui-validate-watch
	    	      if (attrs.uiValidateWatch) {
	    	        watch = scope.$eval(attrs.uiValidateWatch);
	    	        if (angular.isString(watch)) {
	    	          scope.$watch(watch, function(){
	    	            angular.forEach(validators, function(validatorFn, key){
	    	              validatorFn(ctrl.$modelValue);
	    	            });
	    	          });
	    	        } else {
	    	          angular.forEach(watch, function(expression, key){
	    	            scope.$watch(expression, function(){
	    	              validators[key](ctrl.$modelValue);
	    	            });
	    	          });
	    	        }
	    	      }
*/	    		
	    		
	    	} else {
	    		//remote validation
	    		//var fn = $parse(attr['validation']);
	    		var e = element;	    		
	    		if ($sniffer.hasEvent('input')) {
	    		    e.unbind('input');
	    		}
	    		//rimuove i bind su keydown	    		
	    		e.unbind('keydown');
	    		//il change rimane perché il copia incolla lo voglio
    		
	    		var ngModelGet = $parse(attrs.ngModel),
	    	        ngModelSet = ngModelGet.assign;

	    		//override della funzione di angular per la gestione del cambio valore sulla vista di un ng-model
	    		//per gestire i parser con promise
	    		modelCtrl.$setViewValue = function(value) {
	    			 	modelCtrl.$viewValue = value;
		    	        // change to dirty
		    	        if (modelCtrl.$pristine) {
		    	        	modelCtrl.$dirty = true;
		    	        	modelCtrl.$pristine = false;
		    	          e.removeClass('ng-pristine').addClass('ng-dirty');
		    	          formCtrl.$setDirty();
		    	        }
		    	        var d = $q.defer();
		    	    	var promise = d.promise;	
		    	    	d.resolve(value);		    	    	
		    	        angular.forEach(modelCtrl.$parsers, function(fn) {
		    	        	(function( value ){
			    	        	promise = promise.then(function( res ){ 
			    	        		value = res;
			    	        		return fn(value);
			    	        	});
		    	        	}( value ));
		    	        });
		    	        promise.then(function(value){
		    	        	if (modelCtrl.$modelValue !== value) {
			    	        	modelCtrl.$modelValue = value;
			    	          ngModelSet(scope, value);
			    	          angular.forEach(modelCtrl.$viewChangeListeners, function(listener) {
			    	            try {
			    	              listener();
			    	            } catch(e) {
			    	              log.debug(e);
			    	            }
			    	          });
			    	        }
		    	        });
		    	        
		    	};
	    		
	    		var remoteValidation = function( value ){
	    			var d = $q.defer();
	    			/* TEST * /
	    			setTimeout(function(){	    		
		    				scope.$apply(function(){
			            		if ( value === 'a'){
			            			modelCtrl.$setValidity(validationType, true); //se cambio lo stato precedente => cambia lo stile al input, lo stato al controller del modello (valid/invalid) l'error del controller del modello e invoca il cambio al form  
			            			//return value;
			            			d.resolve(value);
			            		}else{
			            			modelCtrl.$setValidity(validationType, false);
			            			e.after('<span class="'+ validationType +'">'+ value +'</span>');
			            			//return undefined;
			            			d.resolve(undefined);
			            		}  
	                		});
    	    		},2000);
	    			/**/
	    	    	bindResourceCtrl.validate( name ).then( function( r ){
	    	    			var validationErrors = notice.get('validation');
	                		if( angular.isDefined(validationErrors) && validationErrors[name] ){
	                			e.after('<span class="'+ validationType +'">'+  validationErrors[name] +'</span>');
	                			modelCtrl.$setValidity(validationType, false);
	                			d.resolve(undefined);
	                		} else {
	                			modelCtrl.$setValidity(validationType, true);
	                			d.resolve(value);
	                		}
	                });
	    	    	/**/
	    	    	return d.promise;	
	    		};
	    		modelCtrl.$promiseFormatters  = [];
	    		modelCtrl.$promiseFormatters.push( remoteValidation );//la fa solo quando viene caricata la pagina
	    		modelCtrl.$parsers.push( remoteValidation ); //eseguito ogni volta che si fa il blur
	    		
	    		//override del ngModelController per la gestione dei formatters con i promise
	    		scope.$watch(function ngModelWatch() {
	    		    var value = ngModelGet(scope);

	    		    // if scope model value and ngModel value are out of sync
	    		    if (modelCtrl.$modelValue !== value) {

	    		      var formatters = modelCtrl.$promiseFormatters,
	    		          idx = formatters.length;

	    		      modelCtrl.$modelValue = value;
	    		      var d = $q.defer();
		    	      var promise = d.promise;	
		    	      d.resolve(value);
	    		      
	    		      while(idx>=0) {
	    		       // value = formatters[idx](value); non va bene se sono promise	    		    	  
	    		    	  (function( idx, value ){
			    	        	promise = promise.then(function( res ){ 
			    	        		value = res;
			    	        		return formatters[idx](value);
			    	        	});
		    	        	}( idx--, value ));
	    		    	  
	    		      }
	    		      promise.then( function(value){
	    		    	  if (modelCtrl.$viewValue !== value) {
		    		    	  modelCtrl.$viewValue = value;
		    		    	  modelCtrl.$render();
		    		      }	    		    	  
	    		      });
	    		      
	    		      
	    		    }
	    		  });
	    		
	    		
	    		
	    	    e.bind('blur', function(event) {
	    	    	if (modelCtrl.$viewValue !== value) {
	    	    		 e.nextAll("."+ validationType).remove();	    	    	
		    	    	 var value = trim( e.val() );
		    	    	 
	    	    	      scope.$apply(function() {
	    	    	    	  modelCtrl.$setViewValue(value);//setta dirty=true e pristine=false nel controller del modello invoca i parser sul valore e quindi lo rende come variabile nello scope, invoca i $viewChangeListeners
	    	    	      });
	    	    	 }
		    	});
	    		       		
	    	      
	    	}
	    	
	    	
	    }
	};
}]);


angular.module('core').directive('jazzModal',['$compile','notice','resource', 'modals', function($compile, notice,resource,modals) {
	return {
		restrict : "A",	
		link : function(scope, elm, attrs) {
	        scope.$watch("modals.data", function(newValue, oldValue) {
	        	if (newValue!==oldValue){
	        		elm.html(newValue);
		            $compile(elm.contents())(scope);
	           }
	        });
	    }
    };
}]);
/*
angular.module('core').directive('loadingWidget', ['requestNotificationChannel', function (requestNotificationChannel) {
	return {
	    restrict: "A",
	    link: function (scope, element) {
	        // hide the element initially
	        element.hide();
	
	        var startRequestHandler = function() {
	            // got the request start notification, show the element
	            //element.show();
	        	showSpinner(0.4);//startSpinner();
	        };
	
	        var endRequestHandler = function() {
	            // got the request start notification, show the element
	            //element.hide();
	        	hideSpinner();//stopSpinner();
	        };
	        // register for the request start notification
	        requestNotificationChannel.onRequestStarted(scope, startRequestHandler);
	        // register for the request end notification
	        requestNotificationChannel.onRequestEnded(scope, endRequestHandler);
	    }
	};
}]);
*/