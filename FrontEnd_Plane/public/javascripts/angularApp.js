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
		.state('planeslist', {
			url : '/planeslist',
			templateUrl : '/planeslist.html',
			controller : 'PlanesListCtrl as planesListCtrl',
		})
		.state('verify', {
			url : '/verify',
			templateUrl : '/verify.html',
			controller : 'VerifyCtrl as verifyCtrl',
		})
    $urlRouterProvider.otherwise('home');
  }]);

/*--------------------------------------CONTROLLER--------------------------------------*/
app.controller('MainCtrl',['$http', '$timeout', function($http, $timeout) {
	// MainCtrl
	var ctrl = this;

	this.isNotify = false;
	this.notifyMsg = '';

	this.isRoundTrip = false;
	this.departDate = null;
	this.arriveDate = null;
	this.adults = 1
	this.child = 0
	this.listDepart = [];
	this.departId = null;
	this.listArrive = [];
	this.arriveId = null;

	this.defaultAdultArray = [1,2,3];
	this.defaultChildArray = [0,1];

	this.getDepartAirport = function() {
		$http.get('http://139.162.58.193:10011/sanbay').success(function(data) {
			ctrl.listDepart = data.sanbay;
		});
	}

	this.getDepartAirport();

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
			ctrl.showNotify('Ngày đi không hợp lệ');

			return;
		}

		if (ctrl.isRoundTrip) {
			if (ctrl.arriveDate != null && ctrl.arriveDate < ctrl.departDate) {
				ctrl.departDate = null;
				ctrl.showNotify('Ngày đi không hợp lệ');		
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

	this.departIdChanged = function() {
		var reqURL = 'http://139.162.58.193:10011/sanbay?masanbaydi=' + ctrl.departId;
		
		$http.get(reqURL).success(function(data) {
			console.log(data);
			ctrl.listArrive = data.sanbay;
		});
	}

	this.checkValidForm = function() {
		if (ctrl.departDate == null
			|| ctrl.departId == null
			|| ctrl.arriveId == null
			|| (ctrl.isRoundTrip && ctrl.arriveDate == null)) {
			return false;
		}

		return true;
	}

	this.submit = function() {
		if (!ctrl.checkValidForm()) {
			ctrl.showNotify('Vui lòng điền đầy đủ thông tin');

			return;
		}

		var reqURL = '';

		// $http.get().success(function(data) {

		// });
	}
}]);

app.controller('VerifyCtrl',['$http', '$timeout', function($http, $timeout) {
	
	var ctrl = this;


}]);

app.controller('PlanesListCtrl',['$http', '$timeout', function($http, $timeout) {
	
	var ctrl = this;
	this.title = {};
	this.titleArray = ['Ông', 'Bà', 'Cô'];

}]);