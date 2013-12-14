/**
 * load a resource file like js or css
 * @param fileName
 * @param fileType js|css if no fileType was passed it will be computed from the fileName (optional)
 * @callback function called on js file loaded (optional)
 */
function loadResource( fileName, fileType, callback){
//	if (target === null || typeof target === "undefined" ){
//		target = document;
//	}
	if ( fileType === null || typeof fileType === "undefined" ){
		fileType = fileName.substr(fileName.lastIndexOf('.') + 1);
	}
	var fileref = null;
	if ( fileType == "js" ){ //if fileName is a external JavaScript file
		fileref = document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.setAttribute("src", fileName);
		fileref.setAttribute("data", "extra-javascript");	
		addTagListener(fileName, fileref, callback);
		document.getElementsByTagName("body")[0].appendChild(fileref);
	}
	else if ( fileType == "css" ){ //if fileName is an external CSS file
		fileref = document.createElement("link");
		fileref.setAttribute("rel", "stylesheet");
		fileref.setAttribute("type", "text/css");
		fileref.setAttribute("href", fileName);
		fileref.setAttribute("data", "extra-stylesheet");
		//addTagListener(fileName, fileref, callback);//NON SUPPORTATO DA TUTTI I BROWSER
		document.getElementsByTagName("head")[0].appendChild(fileref);
	}
}

function addTagListener(fileName, fileref, callback){
	if ( callback !== null && typeof callback !== "undefined" ){			
		if (fileref.readyState){ // IE
			fileref.onreadystatechange = function(){
				if (fileref.readyState == "loaded" || fileref.readyState == "complete"){
					fileref.onreadystatechange = null;
					callback(fileName);
				}
			};
		} else { // Others
			fileref.onload = function(){
				callback(fileName);
			};
		}
	}
}

function removeTargetElementWithAttribute( targetElement , targetAttr, fileName){
	var allSuspects = document.getElementsByTagName(targetElement);
	//console.log(allSuspects[16]);
	var attribute = null;
	for (var i = allSuspects.length; i >= 0; i--){ //search backwards within nodelist for matching elements to remove
		//if (allSuspects[i]){console.log(allSuspects[i]);}
		if ( allSuspects[i] && (allSuspects[i].getAttribute("data")==targetAttr) && (typeof fileName === "undefined")){		   
			attribute = allSuspects[i].getAttribute("src");
			if (attribute==null){
				attribute = allSuspects[i].getAttribute("href");
			}
			if (attribute!=null && attribute.indexOf(fileName)!=-1 ){			
				allSuspects[i].parentNode.removeChild( allSuspects[i] ); //remove element by calling parentNode.removeChild()
			}
	 	}
	}
}

function removeResource( fileName, fileType ){
	var targetElement = (fileType=="js") ? "script" : (fileType=="css") ? "link" : "none"; //determine element type to create nodelist from
	var targetAttr = (fileType=="js") ? "src" : (fileType=="css")? "href" : "none"; //determine corresponding attribute to test for
	
	removeTargetElementWithAttribute( targetElement , targetAttr , fileName );
}

function removeExtraResources(){
/*	var targetAttr = "extra-javascript";
	var targetElement = "script";
	removeTargetElementWithAttribute( targetElement , targetAttr );
	
	targetElement = "link";
	targetAttr = "extra-stylesheet";	
	removeTargetElementWithAttribute( targetElement , targetAttr );
*/
	jQuery('[data="extra-javascript"]').remove();
	jQuery('[data="extra-stylesheet"]').remove();
}

/****************************************************************************************
 *  ARRAY MERGE                                                                         *
 ****************************************************************************************/
/* */
function mergeJsonArray(array1, array2) {
	if (!array1){
		return array2;
	}
	if (!array2){
		return array1;
	}
	var finalArray = array1.slice(0);
	for ( var i = 0; i < array2.length; i++) {		
		insertElementIntoJsonArray(array2[i], finalArray);
	}
	return finalArray;
};

function insertElementIntoJsonArray(item, arrayData){
    var alreadyExists = false;
    for(var i = 0; i < arrayData.length; i++){
    	if ( arrayData[i] === item ) { alreadyExists = true; break;}
    }    
    if(!alreadyExists){
        arrayData.push(item);
    }
};
//*/

function mergeObject(obj1,obj2){
	
    for (var property in obj2) { 
    	
    	if (typeof obj2[property] === 'object'){
    		if (typeof obj1[property]!=='undefined'){
    			mergeObject(obj1[property] , obj2[property]);	
    		} else {
    			obj1[property] = obj2[property];
    		}
    		
    	} else {
    		if (typeof obj1[property]!=='undefined'){
    			if (typeof obj1[property] === 'array'){
    				obj1[property].push( obj2[property] );    				
    			} else {
    				//console.error("[mergeObject] impossibile caricare l'oggetto "+ obj2[property] + " in "+ property);
    			}
    		} else {
    			obj1[property] = obj2[property];
    		}
    	}
    }
}

/**
 * Fa il merge di due array che contengono oggetti json con un campo position 
 * in modo che l'array risultante abbia gli elementi ordinati per position.
 */
function combine() {
    var ar = [];
    return ar.concat.apply(ar, arguments).sort(function (a, b) {
        var ap = a.position;
        var bp = b.position;
        if (typeof ap === 'undefined'){ return 1;}
        if (typeof bp === 'undefined'){ return -1;}
        if (ap < bp) {
            return -1;
        } else if (ap == bp) {
            return 0;
        } else {
            return 1;
        };
    });
};

function isConteined( obj , arr ) {
	//if (typeof arr === 'Array' ){
		return (arr.indexOf(obj) != -1);
	//}else {
	//	return false;
	//}
}
/****************************************************************************************
 *  MAIN                                                                                *
 ****************************************************************************************/ 
	var applicationContext = "/";//contesto applicazione web (virtual-host)	
	var applicationPath = "../"; //percorso relativo a index.html dove trovare i moduli specifici dell'applicazione
   	var conf = {
	        "logo": "",
			"language" : "it",
			"languages" : ["it"],
			"log": {
				"level" : 0,
			    "whiteList": ".*"
			},
			"server_name": "http://localhost",
			"initUrl": null,//applicationContext!= "/" ? (applicationContext+'/base/getGlobalData') : ('/base/getGlobalData');
			"serverContext": applicationContext,
			"backendPath": applicationContext,
	     	"authorization": {
				"environment":"test",
				"service":"test"
			},
			"environments": {
					"test" : "test",
					"prod" : "prod",
					"stag" : "stag"
			},
			"environment": "test"			
	};
	
	var TIMEOUT = 100000; //milliseconds

	var path = {
			"login"     : "/login",
			"dashboard" : "/dashboard"
	};
	
	var cookie = {
			"authorization" : {
				"name" : "session"
			},
			"backUrl":{
				"name" : "backUrl"
			},
			"settings":{
				"name"   : "settings",
				"domain" : "localhost",
				"ttl"    : -1
			}
	};
	
	var role = {
			"anonymous": "anonymous",
			"administrator" : "administrator"
	};
	
	
    var modules = ['core','dashboard','login'];//,'rest','widgets','settings','fileupload'
    
    function getModulePath( moduleName ){
    	var modulePath = applicationPath + "modules/";
//		if ( isConteined( moduleName , application_modules ) ){
//			modulePath = applicationPath + "/modules";
//		}		
    	return modulePath;
    }
    
    //Load specific application configuration merging into defualt value
    var d = jQuery.Deferred();	    
    jQuery.ajax({
		url: applicationPath + 'environment.json', dataType: "json", timeout: TIMEOUT
	}).done( function( data, textStatus, jqXHR ){	
		if (typeof data !== 'undefined' && typeof data.environment !== 'undefined'){			
		    conf.environments = data.environments;
		    conf.environment = data.environment;
			jQuery.ajax({
				url: applicationPath + 'config.'+ data.environment +'.json', dataType: "json", timeout: TIMEOUT
			}).done( function( data, textStatus, jqXHR ){			
				if (typeof data !== 'undefined'){			
					if (typeof data.modules !== 'undefined'){
						d.notify("Moduli specifici da caricare :"+ JSON.stringify(data.modules));
						modules  = mergeJsonArray(modules ,  data.modules); //
						//platform_modules = jQuery.extend( [], platform_modules ,  data.platform_modules );
					}		
					if (typeof data.languages !== 'undefined' && data.languages.length>0){
						conf.languages = data.languages;
					}
					if (typeof data.language !== 'undefined'){
						conf.language = data.language;
					}
					if (typeof data.log !== 'undefined'){
						if(typeof data.log.level !== 'undefined'){
							conf.log.level = data.log.level;
						}
						if(typeof data.log.whiteList !== 'undefined'){
							conf.log.whiteList = data.log.whiteList;
						}				
					}
					if (typeof data.serverContext !== 'undefined'){				
						conf.serverContext = data.serverContext;
					}
					if (typeof data.backendPath !== 'undefined'){				
						conf.backendPath = data.backendPath;
					}
					if (typeof data.server_name !== 'undefined'){				
						conf.server_name = data.server_name;
						conf.server_name = conf.server_name.replace(/\/+$/, '');
					}
					if (typeof data.initUrl !== 'undefined'){
						conf.initUrl = data.initUrl;
					}
					if (typeof data.timeout !== 'undefined'){
						TIMEOUT = data.timeout;
					}
					if (typeof data.environments !== 'undefined'){
						conf.environments = data.environments;
					}
					if (typeof data.environment !== 'undefined'){
						conf.environment = data.environment;
					}
					if (typeof data.authorization !== 'undefined'){
						conf.authorization = data.authorization;
					}
					if (typeof data.cookie !== 'undefined'){
						cookie = data.cookie;
					}
					if (typeof data.logo !== 'undefined'){
						conf.logo = data.logo;
					}
				} else {
					d.notify("File di configurazione corrotto: "+ JSON.stringify(data));
				}
				d.resolve();	
			}).fail( function( jqXHR, textStatus, errorThrown ){
				d.notify("Errore nel caricamento del file di configurazione");
				d.resolve();
			});
		} else {
			d.notify("File degli ambienti corrotto: "+ JSON.stringify(data));
			d.resolve();
		}
		
	}).fail( function( jqXHR, textStatus, errorThrown ){
		d.notify("Errore nel caricamento del file degli ambienti");
		d.resolve();
	});
    
    d.promise().progress(function(msg){jQuery('#loadingMessages').html(msg);}).then(function(){
    	//modules  = mergeJsonArray(modules,application_modules );
    	bootstrap();
    });	
	
/**
 * Bootstrap the application
 */	
function bootstrap(){	
	var errors = [];
	var module = null;	
	var translations = {};
	var menus = [];	
	
	var loadModuleMenu = function( module , path){
		if (typeof path === 'undefined'){
			path = "";
		}
		var d = jQuery.Deferred();
		jQuery.ajax({
			url: path + module +'/config/menu.json', dataType: "json", timeout: TIMEOUT
		}).done( function( data, textStatus, jqXHR ){			
			menus = combine(menus , data);
			d.notify("Caricato il menu del modulo "+ module);
			d.resolve({"data":data,"module":module});
		})/*.fail( function( jqXHR, textStatus, errorThrown ){
	//console.log("====================== Modulo non caricato: "+ module);			
			d.notify("Impossibile caricare la lingua "+ language +" per il modulo "+ module);
			d.reject({"data":null,"module":module, "error":errorThrown});
		});*/
		.fail( function( jqXHR, textStatus, errorThrown ){
			d.resolve({"data":null,"module":module});
		});
		return d.promise();
	};
	
	var loadModuleTranslation = function( module , language , path){
		if (typeof path === 'undefined'){
			path = "";
		}
		var d = jQuery.Deferred();
		jQuery.ajax({
			url: path + module +'/translations/messages.'+ language +'.json', dataType: "json", timeout: TIMEOUT
		}).done( function( data, textStatus, jqXHR ){			
			if (typeof translations[language] === "undefined"){
				translations[language] = {};
			}
			//if (typeof translations[language][module] === "undefined"){ translations[language][module]  {};}
			
			mergeObject(translations[language], data);
			
			//translations[language][module] = data[module];/*FIXME: ciclare tutti i campi di data e metterli in append a translations[language]*/
			d.notify("Caricata la lingua "+ language +" per il modulo "+ module);
			d.resolve({"data":data,"module":module});
		})/*.fail( function( jqXHR, textStatus, errorThrown ){
	//console.log("====================== Modulo non caricato: "+ module);			
			d.notify("Impossibile caricare la lingua "+ language +" per il modulo "+ module);
			d.reject({"data":null,"module":module, "error":errorThrown});
		});*/
		.fail( function( jqXHR, textStatus, errorThrown ){
			d.resolve({"data":null,"module":module});
		});
		return d.promise();
	};
	
	var loadPipedResources = function(i, data, module, path){
		if (typeof path === 'undefined'){
			path = "";
		}
		var d = jQuery.Deferred();
		
		(function( index , data ,module, d ){
			var file, fileType = null;
			if (index < data.length){
				file = module + data[index];
				fileType = file.substr( file.lastIndexOf('.') + 1 );		
				//if ( fileType === "js" ){ resources[ file ] = 1; }
				
				loadResource( path +file, fileType, function(filename){ 
					d.notify("Caricata la risorsa "+ filename);
					d.resolve({"data":filename});/*index++; loadPipedResources(index,data);*/ /*delete resources[filename];*/ 
				});
				if ( fileType === "css" ){d.resolve({"data":+ path + file});}
				
			 } else {
				 d.notify("Il sistema sta cercando di caricare una risorsa in più del dovuto ("+ index +") per il modulo "+ module);					
				 d.reject({"error":"indice superato"});
			 } 
			
		}(i , data , module , d));
		
		return d.promise();
		
	};
	
	var queueResource = function( data ,module, path){
		var startDeferred = jQuery.Deferred();
		var promise = startDeferred.promise();
		startDeferred.resolve();
		
		var index = 0;
		while (index < data.length){		
			(function(index, data, module){			
				promise = promise.then(function(){ 
					return loadPipedResources( index , data , module, path);
				});
			}(index++, data, module));
		}	
		
		var d = jQuery.Deferred();		
		promise.then(function(data){ d.resolve(data); },function(data){ d.reject(data); });		
		return d.promise();
	};
	
	var loadAllModuleTranslations = function( data ,module, path){
		var startDeferred = jQuery.Deferred();
		var promise = startDeferred.promise();
		startDeferred.resolve();
	
		var index = 0;
		while (index < conf.languages.length){		
			(function(index, languages, module){			
				promise = promise.then(function(){ 
					return loadModuleTranslation(module, languages[index], path);
				});
			}(index++, conf.languages, module));
		}	
	
		var d = jQuery.Deferred();		
		promise.then(function(data){ d.resolve(data); },function(data){ d.reject(data); });		
		return d.promise();
	};
	
	var loadModuleResources = function( module, data , path){
		var d = jQuery.Deferred();		
		queueResource(data, module, path).done(function(res){ 
			loadAllModuleTranslations(data,module, path).done(function(res){ 
				loadModuleMenu(module, path).done(function(res){ 
					d.resolve();	
				}).fail(function(data){ d.reject(); });
			}).fail(function(data){ d.reject(); });
		}).fail(function(data){ d.reject(); });
		
		return d.promise();
	};	

	//legge il file resource.json per ogni modulo
	var loadModule = function(module, path){
		if (typeof path === 'undefined'){
			path = getModulePath(module);
		}
		var d = jQuery.Deferred();
		jQuery.ajax({
			url: path + module +'/config/resources.json', dataType: "json", timeout: TIMEOUT
		}).done( function( data, textStatus, jqXHR ){						
			d.notify('Caricamento del modulo '+ module + ' in corso...');
			//d.resolve({"data":data,"module":module});	
			//console.log('Caricamento del modulo '+ module + ' in corso...');
			loadModuleResources( module ,data , path).done( function( data, textStatus, jqXHR ){	
				d.notify('Caricamento del modulo '+ module + ' eseguito con successo');				
//				setTimeout(function(){
				d.resolve();//{"data":data,"module":module}
//				},3000);
			}).fail( function( jqXHR, textStatus, errorThrown ){
				d.notify('Caricamento del modulo '+ module + ' terminato con errore');
				d.reject();//{"data":null,"module":module, "error":errorThrown}
			});
		}).fail( function( jqXHR, textStatus, errorThrown ){			
			//console.log("Errore nel caricamento del modulo "+ module);
			d.notify("Errore nel caricamento del modulo "+ module);
			d.reject();//{"data":null,"module":module, "error":errorThrown}
		});
		return d.promise();
	};
	//--------------------------------------------------------------------------------
	var d = jQuery.Deferred();
	var promise = d.promise();	
	var index = 0;	
	d.resolve();
	//carica i moduli di piattaforma
	while (index < modules.length){	
		(function( module ){
			promise = promise.then(function(){ 
				return loadModule( module);  
			});
		}( modules[index++] ));
	}
	
	promise.progress(function(msg){jQuery('#loadingMessages').html(msg);}).then(function(){
		//Manual initialization of angular
		angular.element(document).ready(function() {
			angular.module('app' , modules ).run(['$rootScope','logFactory', function($rootScope,logFactory) {
				var log = logFactory('run');
				log.debug('run app');
				log.debug(modules);					
				$rootScope.menu = menus;
				delete menus;
				
				$rootScope.translations = translations;
				log.debug($rootScope.translations);
				delete translations;
											
			}]);							
			angular.bootstrap(document,['app']); //avvio manuale dell'applicazione angular
			//stopSpinner();	
		});
		
	}, function(){
		if ( (typeof errors !== "undefined") && (!jQuery.isEmptyObject(errors) ) ){			
			var html = jQuery('<div class="verticalCenter">');
			html.append(jQuery('<h1>').text("Impossibile caricare l'applicazione"));
			for (index in errors){
				html.append(errors[index]).append('<br />');					
			}
			jQuery("#overlay").html(html);
		}
	});
}