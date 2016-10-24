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
app.controller('MainCtrl',['$http', '$timeout', function($http, $timeout) {
	var ctrl = this;

	this.isNotify = false;
	this.notifyMsg = '';

	this.isRoundTrip = false;
	this.departDate = null;
	this.arriveDate = null;
	this.adults = 1
	this.child = 0
	this.listDepart = {};
	this.departId = null;
	this.listArrive = {};
	this.arriveId = null;

	this.defaultAdultArray = [1,2,3];
	this.defaultChildArray = [0,1];

	this.showNotify = function(msg) {
		ctrl.notifyMsg = msg;
		ctrl.isNotify = true;

		$timeout(function() { ctrl.isNotify = false; ctrl.notifyMsg = ''; }, 2000);
	}

	this.adultChanged = function() {
		if (ctrl.child > ctrl.adults) {
			ctrl.child = 0;
		}

		ctrl.defaultChildArray = [];
		for (var i = 0; i <= ctrl.adults; i++) {
			ctrl.defaultChildArray.push(i);
		}
	}

	this.getCurrentDate = function() {
		var curDate = new Date();
		var res = curDate.getTime();

		res -= (curDate.getHours() * 3600 + curDate.getMinutes() * 60 + curDate.getSeconds()) * 1000 + curDate.getMilliseconds();

		return res;
	}

	this.departDateChanged = function() {
		var curDate = ctrl.getCurrentDate();
		
		console.log("Ngay di: " + ctrl.departDate.getTime());
		console.log("Ngay hien tai: " + curDate);

		if (ctrl.departDate.getTime() < curDate) {
			ctrl.departDate = null;
			ctrl.showNotify('Ngày đi không hợp lệ 1');

			return;
		}

		if (ctrl.isRoundTrip) {
			if (ctrl.arriveDate != null && ctrl.arriveDate < ctrl.departDate) {
				ctrl.departDate = null;
				ctrl.showNotify('Ngày đi không hợp lệ 2');		
			}
		}
	}

	this.arriveDateChanged = function() {
		var curDate = ctrl.getCurrentDate();

		if (ctrl.arriveDate.getTime() < curDate || (ctrl.departDate != null && ctrl.arriveDate < ctrl.departDate)) {
			ctrl.arriveDate = null;
			ctrl.showNotify('Ngày về không hợp lệ');
		}
	}

	this.find = function() {
		console.log("Tim chuyen bay");
	}
}]);