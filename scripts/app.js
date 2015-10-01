"use strict";

function getIcon(toggled) {
    return (toggled === 0 ? icons['off'] : icons['on']);
}
var icons = {
    'on': 'done',
    'off': 'close'
};
var ledsDictionary = {
    0: 0,
    1: 2
};


angular.module('iot-app', ['ngMaterial', 'ngMdIcons'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('red')
    })
    .controller('AppController', ['$scope', '$http', '$mdDialog', '$interval',
        function($scope, $http, $mdDialog, $interval) {
            $scope.connection = {
                ip: '192.168.1.102',
                port: '80'
            };
            $scope.switches = [0, 1].map(function(i) {
                return {
                    'toggled': 0,
                    'icon': getIcon(0)
                };
            });
            $scope.distance = 0;

            $scope.setToggles = function($index) {
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

            var getWaterLevelTimer = function(requestUrl) {
            	var responsePromise = $http.get(requestUrl);
            	responsePromise.success(function(data, status, headers, config) {
            		$scope.distance = data['distancia'];
            	});
            };

            $scope.startGetWaterLevelTimer = function() {
        		if ($scope.timer !== null || $scope.timer !== undefined) {
            		$interval.cancel($scope.timer);
        		}
        		var requestUrl = "http://" + $scope.connection.ip + ":" + $scope.connection.port +
            		"/distancia";
            	getWaterLevelTimer(requestUrl);
            	$scope.timer = $interval(function() { getWaterLevelTimer(requestUrl) }, 2000);
            };
        } 
    ]);