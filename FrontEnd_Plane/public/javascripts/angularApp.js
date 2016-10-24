'use strict';
var app = angular.module('planeApp', ['ngMaterial', 'ui.router'])
				.config(function($mdThemingProvider) {
				  $mdThemingProvider.theme('default')
				    .primaryPalette('pink')
				    .accentPalette('orange');
				});

app.config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
		.state('home', {
			url : '/home',
			templateUrl : '/find.html',
			controller : 'MainCtrl as mainCtrl',
		})
    $urlRouterProvider.otherwise('home');
  }]);

/*--------------------------------------CONTROLLER--------------------------------------*/
app.controller('MainCtrl',['$scope', '$http', function($scope, $http) {
	// Co khu hoi hay khong
	$scope.isRoundTrip = false;

	// Ngay di
	$scope.departDate = null;

	// Ngay ve
	$scope.arriveDate = null;

	// So luong nguoi lon
	$scope.adults = 1

	// So luong tre em
	$scope.child = 0

	// Danh sach san bay di
	$scope.listDepart = {};

	// San bay di dang duoc chon
	$scope.departId = null;

	// Danh sach san bay den
	$scope.listArrive = {};

	// San bay den dang duoc chon
	$scope.arriveId = null;
}]);