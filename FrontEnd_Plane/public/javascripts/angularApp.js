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
		.state('planelist', {
			url : '/planelist',
			templateUrl : '/planeslist.html',
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
    $urlRouterProvider.otherwise('home');
  }]);

/*--------------------------------------GET SERVER SERVICE--------------------------------------*/
app.service('serverService', function() {
	var service = this;

	this.server = 'http://139.162.58.193:10012';

	this.getServer = function() {
		return service.server;
	}
});

/*--------------------------------------PLANE LIST SERVICE--------------------------------------*/
app.service('planeListService', function() {
	var service = this;

	this.planeList = [];

	this.updatePlaneList = function(data) {
		service.planeList = [];

		if (data != null && data.length > 0) {
			service.planeList = data;
		}
	}

	this.getPlaneList = function() {
		return service.planeList;
	}
});

/*--------------------------------------ERROR SERVICE--------------------------------------*/
app.service('errorService', function() {
	var service = this;

	this.error = null;

	this.setError = function(err) {
		console.log('Error service: setError - ' + err);

		service.error = err;
	}

	this.getError = function() {
		console.log('Error service: getError - ' + service.error);

		return service.error;
	}
})

/*--------------------------------------MAIN CONTROLLER--------------------------------------*/
app.controller('MainCtrl',['$http', '$timeout', '$state', 'serverService', 'errorService', 
							function($http, $timeout, $state, serverService, errorService) {
	// MainCtrl
	var ctrl = this;

	this.isNotify = false;
	this.notifyMsg = '';

	this.isRoundTrip = false;
	this.departDate = null;
	this.arriveDate = null;
	this.seats = 1
	this.listDepart = [];
	this.departId = null;
	this.listArrive = [];
	this.arriveId = null;
	this.type = null;
	this.cost = null;

	this.defaultSeatArray = [1,2,3];
	this.defaultTypeArray = ['Tất cả', 'C', 'Y'];
	this.defaultCostArray = ['Tất cả', 'E', 'F', 'G'];

	this.reset = function() {
		ctrl.isNotify = false;
		ctrl.notifyMsg = '';

		ctrl.isRoundTrip = false;
		ctrl.departDate = null;
		ctrl.arriveDate = null;
		ctrl.seats = 1
		ctrl.listDepart = [];
		ctrl.departId = null;
		ctrl.listArrive = [];
		ctrl.arriveId = null;
		ctrl.type = null;
		ctrl.cost = null;

		ctrl.defaultSeatArray = [1,2,3];
		ctrl.defaultTypeArray = ['Tất cả', 'C', 'Y'];
		ctrl.defaultCostArray = ['Tất cả', 'E', 'F', 'G'];		
	}

	this.getDepartAirport = function() {
		$http.get(serverService.getServer() + '/sanbay?truong=city').success(function(data) {
			ctrl.listDepart = data.sanbay;
		});
	}

	this.getDepartAirport();

	this.showNotify = function(msg) {
		ctrl.notifyMsg = msg;
		ctrl.isNotify = true;

		$timeout(function() { ctrl.isNotify = false; ctrl.notifyMsg = ''; }, 2000);
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
		var reqURL = serverService.getServer() + '/sanbay?truong=city&masanbaydi=' + ctrl.departId;
		
		ctrl.arriveId = null;

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
			ctrl.showNotify('Bạn chưa điền đủ thông tin hoặc thông tin chưa hợp lệ');


		return;
	}

		var reqURL = serverService.getServer() + '/chuyenbay?masanbaydi=' + ctrl.departId
						+ '&masanbayden=' + ctrl.arriveId
						+ '&ngaydi=' + ctrl.departDate.getTime() / 1000;

		if (ctrl.isRoundTrip) {
			reqURL += ('&ngayve=' + ctrl.arriveDate.getTime() / 1000);
		}

		if (ctrl.type != null && ctrl.type != 'Tất cả') {
			reqURL += ('&hang=' + ctrl.type);
		}

		if (ctrl.cost != null && ctrl.cost != 'Tất cả') {
			reqURL += ('&mucgia=' + ctrl.cost);
		}

		if (ctrl.seats > 1) {
			reqURL += ('&soluongghe=' + ctrl.seats);
		}

		var x = 'Tất cả';

		console.log(x == 'Tất cả');
		console.log(reqURL);

		$http.get(reqURL).success(function(data) {
			$state.go('planelist');
		}).error(function(err) {
			errorService.setError('Đã có lỗi xảy ra, vui lòng thử lại sau!');
			$state.go('error');
		});
	}
}]);

/*--------------------------------------PLANE LIST CONTROLLER--------------------------------------*/
app.controller('PlaneListCtrl',['$http', '$state', function($http, $state) {	
	var ctrl = this;

	this.isEmpty = false;

	this.goHome = function() {
		$state.go('home');
	}
}]);

/*--------------------------------------MAIN CONTROLLER--------------------------------------*/
app.controller('VerifyCtrl',['$http', '$timeout', function($http, $timeout) {
	var ctrl = this;


}]);

/*--------------------------------------ERROR CONTROLLER--------------------------------------*/
app.controller('ErrorCtrl',['$http', '$state', 'errorService', function($http, $state, errorService) {
	var ctrl = this;
	this.error = errorService.getError();

	this.goHome() = function() {
		$state.go('home');
	}
}]);

app.controller('InfoCtrl',['$http', '$timeout', function($http, $timeout) {
	
	var ctrl = this;
	this.title = {};
	this.titleArray = ['Ông', 'Bà', 'Cô'];
	this.titleChildArray = ['Cháu', 'Bé'];
	this.isNotify = false;
	this.notifyMsg = '';

	this.showNotify = function(msg) {
		ctrl.notifyMsg = msg;
		ctrl.isNotify = true;

		$timeout(function() { ctrl.isNotify = false; ctrl.notifyMsg = ''; }, 2000);
	}


	this.persons = [];
	var count1 = 2;
	var count2 = 2;
	for(var i = 0; i < count1; i++) {
		this.persons.push({});
	}
	this.children = [];
	for(var i = 0; i < count2; i++) {
		this.children.push({});
	}

	this.checkValidForm = function() {
		for(var i = 0; i < count1; i++) {
			if(this.persons[i].title == null || this.persons[i].lastName == null || this.persons[i].firstName == null)
				return false;
		}

		for(var i = 0; i < count2; i++) {
			if(this.children[i].title == null || this.children[i].lastName == null || this.children[i].firstName == null)
				return false;
		}	
		return true;	
	}

	this.check = function() {

		if (!ctrl.checkValidForm()) {
		ctrl.showNotify('Vui lòng điền đầy đủ thông tin');
			return;
		} else {
			console.log(this.persons);
			console.log(this.children);
		}
	};
}]);