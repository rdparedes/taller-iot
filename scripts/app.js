
angular.module('iot-app', ['ngMaterial', 'ngMdIcons'])
	.config(function($mdThemingProvider) {
		$mdThemingProvider.theme('default')
			.primaryPalette('red')
			.accentPalette('yellow')
	})
	.controller('AppController', ['$scope', function($scope) {
		$scope.getTimes = function(n) {
			return new Array(n);
		};
	}]);

