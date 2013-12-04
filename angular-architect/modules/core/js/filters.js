/* * /
angular.module('core').filter('test', function () {
	return function(value){
		var args = [].slice.call(arguments);	
		console.log(args);
	}
});
//*/

angular.module('core').filter('startsWith', function () {
    return function (text,prefix) {
        return (text.indexOf(prefix) == 0); 
    };
});

angular.module('core').filter('slugify', function () {
	return function (text) {
		if (angular.isDefined(text)) {
			/* 
			 * 1) translitterazione dei caratteri balordi tipo le accentate
			 * 2) tolgo gli spazi ad inizio e fine
			 * 3) replace degli spazi con -
			 * 4) tutto minuscolo
			 * 5) tutto ciò che resta che non è lettera o numero lo elimina
			*/
			text = transliterate(text);
			text = text.replace(/^\s+|\s+$/g, '')
					   .replace(/[-\s]+/g, '-')
					   .toLowerCase()
					   .replace(/[^-\w]/g, '');
		} else {
			text = '';
		}
		
		return text;
	};
});

angular.module('core').filter('urlify', function () {
	return function (text) {
		if (angular.isDefined(text)) {
			text = transliterate(text);
			text = text.replace(/^\s+|\s+$/g, '') // spazi a inizio o fine stringa vengono eliminati
					   .replace(/[-\s]+/g, '-') // occorrenze (anche multiple) di "-" e " " vengono sostituite con "-"
					   .toLowerCase() // convertito tutto a minuscolo
					   .replace(/[^-\w\/{}]|/g, '') // tutto ciò che non è "-", a-z, A-Z, 0-9, "_", "{", "}", "/" viene eliminato
					   .replace(/\/{2,}/g, '/') // sequenze doppie o più di "/" vengono sostituite con una sola
					   .replace(/\{{2,}/g, '{') // sequenze doppie o più di "{" vengono sostituite con una sola
					   .replace(/\}{2,}/g, '}'); // sequenze doppie o più di "}" vengono sostituite con una sola
		} else {
			text = '';
		}
		
		return text;
	};
});

angular.module('core').filter('truncate',function(){
	return function(text, length, end){ return truncate(text, length, end); };
});

angular.module('core').filter('splitline',function(){
	return function(text, length) { return split(text, length); };
});

angular.module('core').filter('contains',function(){
	return function(collection, element,index) { return contains(collection, element,index); };
});
/**
 * filtro per le traduzioni (da fare transchoice)
 * si usa così {{"admin.settings.qualcosa"|trans}}
 * o {{"admin.settings.qualcosa"|trans:{"%placeholder%":"qualcosa","%altroplaceholder%":"qualcosaltro"} }}
 */
angular.module('core').filter('trans', function (commons) {
    return function ( id ) {
    	var parameters = [].slice.call(arguments);
    	parameters =  parameters.slice(1);
        return commons.trans( id , parameters);
    };
});

angular.module('core').filter('ifEmpty',function(){
	return function(input, defaultValue) {		
		if (angular.isUndefined(defaultValue)){
			defaultValue = "";
		}
		return (angular.isDefined(input) && input!==null && input!=="" && input.length>0) ? input : defaultValue;
	};
});

angular.module('core').filter('iif', function () {
	   return function(input, trueValue, falseValue) {
	        return input ? trueValue : falseValue;
	   };
});

angular.module('core').filter('typeof', function () {
	   return function(element, type) {
	        return typeof element == type;
	   };
});

angular.module('core').filter('capitalize',function(){
	return function(text, allWords, lower){ return capitalize(text, allWords, lower, true); };
});

angular.module('core').filter('uncapitalize',function(){
	return function(text, allWords,lower){ return capitalize(text, allWords, lower, false); };
});
