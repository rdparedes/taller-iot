angular.module('iot-app', ['ngMaterial', 'ngMdIcons'])
	.config(function($mdThemingProvider) {
		$mdThemingProvider.theme('default')
			.primaryPalette('blue')
			.accentPalette('red')
	})
	.controller('AppController', ['$scope', '$http', '$mdDialog', function($scope, $http, $mdDialog) {
		$scope.connection = {
			ip: '192.168.1.105',
			port: '80'
		};

		var icons = { 'on': 'done', 'off': 'close' };
		var ledsDictionary = { 0: 0, 1: 2 }

		var getIcon = function(toggled) {
			return (toggled === 0 ? icons['off'] : icons['on']);
		};
		
		var setToggles = function($index) {
			var requestUrl = "http://" + $scope.connection.ip + ":" + $scope.connection.port + 
								"/digital/" + ledsDictionary[$index];

			var responsePromise = $http.get(requestUrl);

			responsePromise.success(function(data, status, headers, config) {
				item = $scope.switches[$index];
				item['toggled'] == 1 ? item['toggled'] = 0 : item['toggled'] = 1;
				item['icon'] = getIcon($scope.switches[$index]['toggled']);
			});
			responsePromise.error(function() {
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

		$scope.switches = [0,1].map(function(i) {
			return { 'toggled': 0, 'icon': getIcon(0) };
		});

		$scope.itemClicked = function($index) {
			setToggles($index);
		};
	}]);

