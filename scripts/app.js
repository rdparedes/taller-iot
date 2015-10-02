"use strict";

function getIcon(toggled) {
	return (toggled === 0 ? icons.off : icons.on);
}
var icons = {
	'on': 'done',
	'off': 'close'
};
var ledsDictionary = {
	0: 0,
	1: 2
};

angular.module('iot-app', ['ngMaterial', 'ngMdIcons', 'ngTouch'])
	.config(function($mdThemingProvider) {
		$mdThemingProvider.theme('default')
			.primaryPalette('blue')
			.accentPalette('red');
	})
	.controller('AppController', ['$scope', '$http', '$q', '$timeout', '$mdDialog', '$interval',
		function($scope, $http, $q, $timeout, $mdDialog, $interval) {
			$scope.connection = {
				ip: '192.168.1.102',
				port: '80'
			};
			$scope.ledSwitches = [0, 1].map(function(i) {
				return {
					'toggled': 0,
					'icon': getIcon(0)
				};
			});
			$scope.waterDistance = 0;

			$scope.setToggles = function($index) {
				var currentItem = $scope.ledSwitches[$index];

				var requestUrl = 
					"http://" + $scope.connection.ip + ":" + $scope.connection.port + "/digital/" +
					ledsDictionary[$index] + "/" +
					(currentItem.toggled == 1 ? '0' : '1');

				$http.get(requestUrl)
					.then(function(data) {
						currentItem.toggled = data.status;
						currentItem.icon = getIcon(currentItem.toggled);
					}, function() {		// If error in request
						$mdDialog.show(
							$mdDialog.alert()
							.parent(angular.element(document.querySelector('#mainContainer')))
							.clickOutsideToClose(true)
							.title('Error')
							.content('No se pudo completar la petición.')
							.ariaLabel('Error')
							.ok('Hecho')
						);
					});
			};

			var deferred = $q.defer();
			var getWaterLevel = function() {
				var requestUrl = "http://" + $scope.connection.ip + ":" + $scope.connection.port +
						"/distancia";
				
				$http.get(requestUrl, { timeout: deferred.promise })
					.then(function(data) {
						$scope.waterDistance = data.distancia;
					}, function(reject) {
						if (reject.status === 0) {
							// $http timeout
						} else {
							// response error status from server
						}
					});
				$timeout(function() {
					console.error("Request timeout on " + requestUrl);
					deferred.resolve();
				}, 2000);
			};

			var waterLevelTimer;
			$scope.startWaterLevelTimer = function() {
				if (angular.isDefined(waterLevelTimer) ) return;
				
				getWaterLevel();
				waterLevelTimer = $interval(getWaterLevel, 2000);
			};
		} 
	]);