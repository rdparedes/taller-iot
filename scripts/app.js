"use strict";

function getIcon(toggled) {
	return (toggled === 0 ? icons.on : icons.off);
}
var icons = {
	'on': 'done',
	'off': 'close'
};
var ledsDictionary = {
	0: 0,
	1: 2
};

(function() {
	angular.module('iot-app', ['ngMaterial', 'ngMdIcons', 'ngTouch'])
		.config(function($mdThemingProvider) {
			$mdThemingProvider.theme('default')
				.primaryPalette('blue')
				.accentPalette('red');
		})
		.controller('AppController', ['$scope', '$http', '$q', '$timeout', '$mdDialog', '$interval',
			function($scope, $http, $q, $timeout, $mdDialog, $interval) {
				$scope.connection = {
					ip: '192.168.43.214',
					port: '80'
				};
				$scope.ledSwitches = [0, 1].map(function(i) {
					return {
						'toggled': 1,
						'icon': getIcon(1),
						'isSetup': false
					};
				});
				$scope.waterDistance = 0;

				$scope.setupLed = function(index) {
					if (!$scope.ledSwitches[index].isSetup) {
						$http.get('http://' + $scope.connection.ip + ':' + $scope.connection.port + '/mode/' + ledsDictionary[index] + '/o').then(function() {
							$scope.ledSwitches[index].isSetup = true;
							console.log("Led set up successfully");
						});
					} else {
						console.log("Led already set up");
					}
				};

				$scope.setToggles = function($index) {
					var currentItem = $scope.ledSwitches[$index];

					var requestUrl =
						'http://' + $scope.connection.ip + ':' + $scope.connection.port + '/digital/' +
						ledsDictionary[$index] + '/' +
						(currentItem.toggled === 1 ? '0' : '1');

					$http.get(requestUrl)
						.then(function(data) {
							currentItem.toggled = (currentItem.toggled === 1 ? '0' : '1');
							currentItem.icon = getIcon(currentItem.toggled);
						}, function() { // If error in request
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
				var ready = true;
				$scope.getWaterLevel = function() {
					if (ready) {
						ready = false;
						var requestUrl = "http://" + $scope.connection.ip + ":" + $scope.connection.port + "/distancia";

						$http.get(requestUrl, {
							timeout: deferred.promise
						})
							.then(function(data) {
								ready = true;
								$scope.waterDistance = data.distancia;
							}, function(reject) {
								if (reject.status === 0) {
									// $http timeout
								} else {
									// response error status from server
								}
							});
						$timeout(function() {
							ready = true;
							console.error("Request timeout on " + requestUrl);
							deferred.resolve();
						}, 15000);
					}

				};
			}
		]);
})();