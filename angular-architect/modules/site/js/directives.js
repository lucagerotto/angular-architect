'use strict';
/* Directive sample * /
angular.module('site').directive('replaceMyName', [ '$rootScope', function($rootScope) {
	return {
		restrict: "A",		
		 controller: ['$scope', '$element', '$attrs', '$transclude','commons', function($scope, $element, $attrs, $transclude, commons) {			
		}],		
		link: function (scope, element, attrs){			
		}
	};
	
}]);
/**/