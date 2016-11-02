'use strict';
var app = angular.module('planeApp', ['ngMaterial', 'ui.router'])
.config(function($mdThemingProvider) {
	$mdThemingProvider.theme('default')
	.primaryPalette('pink')
	.accentPalette('orange');

	$mdThemingProvider.theme('admin')
	.primaryPalette('yellow')
	.dark();
});

app.config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
		.state('home', {
			url : '/home',
			templateUrl : '/find.html',
			controller : 'MainCtrl as mainCtrl',
		})
		.state('planelist', {
			url : '/planelist',
			templateUrl : '/planeList.html',
			controller : 'PlaneListCtrl as planeListCtrl',
		})
		.state('info', {
			url : '/info',
			templateUrl : '/info.html',
			controller : 'InfoCtrl as infoCtrl',
		})
		.state('verify', {
			url : '/verify',
			templateUrl : '/verify.html',
			controller : 'VerifyCtrl as verifyCtrl',
		})
		.state('error', {
			url: '/error',
			templateUrl: '/error.html',
			controller: 'ErrorCtrl as errorCtrl'
		})
		.state('success', {
			url: '/success',
			templateUrl: '/success.html',
			controller: 'SuccessCtrl as successCtrl'
		})
		.state('login', {
			url: '/login',
			templateUrl: '/login.html',
			controller: 'LoginCtrl as loginCtrl'
		})
		.state('planeListAdmin', {
			url: '/planeListAdmin',
			templateUrl: '/planeListAdmin.html',
			controller: 'PlaneListAdminCtrl as planeListAdminCtrl'
		})
		.state('updatePlane', {
			url: '/updatePlane',
			templateUrl: '/updatePlane.html',
			controller: 'UpdatePlaneCtrl as updatePlaneCtrl'
		})
    $urlRouterProvider.otherwise('home');
  }]);


app.factory('auth', ['$http', '$window', 'serverService',
function($http, $window, serverService) {
  var auth = {};

  auth.saveToken = function(token) {
    $window.localStorage['plane-app-token'] = token;
  };

  auth.getToken = function() {
    
    return $window.localStorage['plane-app-token'];
  }

  auth.isLoggedIn = function() {
    var token = auth.getToken();

    if (token) {
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  auth.logIn = function(user) {
  	var reqURL = serverService.getServer() + '/chungthuc';
    return $http.post(reqURL, user).success(function(data) {
      auth.saveToken(data.token);
    });
  };

  auth.logOut = function() {
    $window.localStorage.removeItem('plane-app-token');
  };
 
  return auth;
}]);