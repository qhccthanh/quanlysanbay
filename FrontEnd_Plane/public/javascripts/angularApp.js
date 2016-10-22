'use strict';
var app = angular.module('planeApp', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
		.state('home', {
			url : '/home',
			templateUrl : '/find.html',
			controller : 'MainCtrl',
		})
    $urlRouterProvider.otherwise('home');
  }]);

/*--------------------------------------CONTROLLER--------------------------------------*/
app.controller('MainCtrl',['$scope', '$http', function($scope, $http){
  $scope.data = {};
  
}]);