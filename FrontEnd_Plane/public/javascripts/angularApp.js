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
		.state('success', {
			url: '/success',
			templateUrl: '/success.html',
			controller: 'SuccessCtrl as successCtrl'
		})
    $urlRouterProvider.otherwise('home');
  }]);

/*--------------------------------------GET SERVER SERVICE--------------------------------------*/
app.service('serverService', function() {
	var service = this;

	this.server = 'http://139.162.58.193:10011';

	this.getServer = function() {
		return service.server;
	}
});

/*--------------------------------------PLANE LIST SERVICE--------------------------------------*/
app.service('planeListService', function() {
	var service = this;

	this.planeList = {};
	this.isRoundTrip = false;

	this.updatePlaneList = function(data, isRoundTrip) {
		service.planeList = {};
		service.isRoundTrip = isRoundTrip;

		if (data != null) {
			service.planeList = data.chuyenbay;
		}

		console.log('planeListService:');
		console.log(service.planeList);
	}

	this.getDepartList = function() {
		return service.planeList.chuyendi;
	}

	this.getArriveList = function() {
		return service.planeList.chuyenve;
	}

	this.getIsRoundTrip = function() {
		return service.isRoundTrip;
	}
});

/*--------------------------------------INFO SERVICE--------------------------------------*/
app.service('infoService', function() {
	this.info = {};

	this.updateInfo = function(data) {
		this.info = data;
	}

	this.getInfo = function() {
		return this.info;
	}

	this.setTicketCount = function(n) {
		this.info.sove = parseInt(n);
	}

	this.setDepartInfo = function(data) {
		this.info.chuyendi = data;
	}

	this.setArriveInfo = function(data) {
		this.info.chuyenve = data;
	}

	this.getTicketCount = function() {
		return this.info.sove;
	}

	this.setSumPrice = function(price) {
		this.info.price = price;
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
app.controller('MainCtrl',['$http', '$timeout', '$state', 'serverService', 'planeListService', 'infoService', 'errorService', 
							function($http, $timeout, $state, serverService, planeListService, infoService, errorService) {
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

		console.log(reqURL);

		$http.get(reqURL).success(function(data) {
			planeListService.updatePlaneList(data, ctrl.isRoundTrip);
			infoService.setTicketCount(ctrl.seats);
			$state.go('planelist');
		}).error(function(err) {
			errorService.setError('Đã có lỗi xảy ra, vui lòng thử lại sau!');
			$state.go('error');
		});
	}
}]);

/*--------------------------------------PLANE LIST CONTROLLER--------------------------------------*/
app.controller('PlaneListCtrl',['$http', '$state', 'serverService', 'planeListService', 'infoService', 'errorService',
								function($http, $state, serverService, planeListService, infoService, errorService) {	
	var ctrl = this;

	this.isRoundTrip = false;
	this.isDepartEmpty = true;
	this.isArriveEmpty = true;
	this.departList = [];
	this.arriveList = [];

	this.departId = -1;
	this.arriveId = -1;

	this.departCode = 'Chưa chọn';
	this.arriveCode = 'Chưa chọn';

	this.init = function() {
		ctrl.departList = planeListService.getDepartList();
		ctrl.arriveList = planeListService.getArriveList();
		ctrl.isRoundTrip = planeListService.getIsRoundTrip();

		if (ctrl.departList != null && ctrl.departList.length > 0) {
			ctrl.isDepartEmpty = false;
		}

		if (ctrl.arriveList != null && ctrl.arriveList.length > 0) {
			ctrl.isArriveEmpty = false;
		}
	}

	this.init();

	this.departClick = function(id) {
		ctrl.departId = id;
		ctrl.departCode = ctrl.departList[id].machuyenbay;
	}

	this.arriveClick = function(id) {
		ctrl.arriveId = id;
		ctrl.arriveCode = ctrl.arriveList[id].machuyenbay;
	}

	this.goHome = function() {
		$state.go('home');
	}

	this.submit = function() {
		var reqURL = serverService.getServer() + "/datcho";
		var tickets = infoService.getTicketCount();

		if (ctrl.departId == -1) {
			return;
		}

		var sumPrice = tickets * ctrl.departList[ctrl.departId].giaban;
		
		var timeString = ctrl.departList[ctrl.departId].ngaydi;
		var str = (timeString || "").replace(/-/g,"/").replace(/[TZ]/g," ");
		var findDot = str.search(".000");
		console.log(str.substring(findDot, 0));
		var dateD = new Date(str.substring(findDot, 0));

		var body = {
			"datcho": {
				"machuyenbay": ctrl.departList[ctrl.departId].machuyenbay,
				"ngaydi": dateD.getTime()/1000,	// parse doan nay ra lay ngay
				"hang": ctrl.departList[ctrl.departId].hang,
				"mucgia": ctrl.departList[ctrl.departId].muc,
				"soghe": tickets
			}
		};

		console.log("dat cho chuyen di");
		console.log(body);
		$http.post(reqURL, body).success(function(data) {
			infoService.setDepartInfo(data.datcho);
		}).error(function(err) {
			errorService.setError('Lỗi xảy ra trong quá trình đặt chỗ. Vui lòng thử lại sau!');
			$state.go('error');
		});

		var timeString = ctrl.departList[ctrl.departId].ngaydi;
		var str = (timeString || "").replace(/-/g,"/").replace(/[TZ]/g," ");
		var findDot = str.search(".000");
		console.log(str.substring(findDot, 0));
		var dateD = new Date(str.substring(findDot, 0));

		if (ctrl.arriveId != -1) {
			body = {
				"datcho": {
					"machuyenbay": ctrl.arriveList[ctrl.arriveId].machuyenbay,
					"ngaydi": dateD.getTime()/1000,	// parse doan nay ra lay ngay
					"hang": ctrl.arriveList[ctrl.arriveId].hang,
					"mucgia": ctrl.arriveList[ctrl.arriveId].muc,
					"soghe": tickets
				}
			};

			sumPrice += tickets * ctrl.arriveList[ctrl.arriveId].giaban;

			console.log("dat cho chuyen ve");
			$http.post(reqURL, body).success(function(data) {
				infoService.setArriveInfo(data.datcho);
			}).error(function(err) {
				errorService.setError('Lỗi xảy ra trong quá trình đặt chỗ. Vui lòng thử lại sau!');
				$state.go('error');
			});
		}

		infoService.setSumPrice(sumPrice);
		$state.go('info');
	}
}]);


/*--------------------------------------Verify CONTROLLER--------------------------------------*/
app.controller('VerifyCtrl',['$http', '$state', '$timeout', 'infoService','serverService', 'errorService', function($http, $state, $timeout, infoService, serverService, errorService) {
	var ctrl = this;
	this.info = infoService.getInfo();

	console.log(this.info);
	if (this.info.chuyenve != null){
		this.isRoundTrip = true;
	} else {
		this.isRoundTrip = false;
	}

	this.goHome - function() {
		$state.go('home');
	}

	this.check = function() {
		var  body = {};
		body.datcho = {};
		body.datcho.madatcho = this.info.chuyendi.madatcho;
		body.datcho.hanhkhach = [];
		for(var i = 0; i < this.info.persons.length; i++) {
			var hanhkhach = {
				"danhxung": this.info.persons[i].title,
				"ho": this.info.persons[i].lastName,
				"ten": this.info.persons[i].firstName
			}
			body.datcho.hanhkhach.push(hanhkhach);
		}
		console.log(body);
		var reqURL = serverService.getServer() + '/datcho';
		$http.put(reqURL, body).success(function(data) {

			if (ctrl.isRoundTrip) {
				var  body = {};
				body.datcho = {};
				body.datcho.madatcho = ctrl.info.chuyenve.madatcho;
				body.datcho.hanhkhach = [];
				for(var i = 0; i < ctrl.info.persons.length; i++) {
					var hanhkhach = {
						"danhxung": ctrl.info.persons[i].title,
						"ho": ctrl.info.persons[i].lastName,
						"ten": ctrl.info.persons[i].firstName
					}
					body.datcho.hanhkhach.push(hanhkhach);
				}
				console.log(body);
				var reqURL = serverService.getServer() + '/datcho';
				$http.put(reqURL, body).success(function(data) {
					$state.go('success');
				}).error(function(err) {
					console.log("loi dat cho 2");
					errorService.setError('Đã có lỗi xảy ra, vui lòng thử lại sau!');
					$state.go('error');
				});
			} else {
				$state.go('success');
			}
		}).error(function(err) {
			console.log("loi dat cho 1");
			errorService.setError('Đã có lỗi xảy ra, vui lòng thử lại sau!');
			$state.go('error');
		});

		
	}

}]);

/*--------------------------------------ERROR CONTROLLER--------------------------------------*/
app.controller('ErrorCtrl',['$http', '$state', 'errorService', function($http, $state, errorService) {
	var ctrl = this;
	this.error = errorService.getError();

	this.goHome = function() {
		$state.go('home');
	}
}]);

app.controller('InfoCtrl',['$http', '$timeout', '$state','infoService', function($http, $timeout, $state, infoService) {
	
	var ctrl = this;
	this.title = {};
	this.titleArray = ['Ông', 'Bà', 'Cô'];
	this.isNotify = false;
	this.notifyMsg = '';
	

	this.showNotify = function(msg) {
		ctrl.notifyMsg = msg;
		ctrl.isNotify = true;
		$timeout(function() { ctrl.isNotify = false; ctrl.notifyMsg = ''; }, 2000);
	}

	this.persons = [];
	for(var i = 0; i < infoService.getTicketCount(); i++) {
		var p = {
			"title": "",
			"lastName": "",
			"firstName": ""
		};
		this.persons.push(p);
	}

	this.checkValidForm = function() {
		for(var i = 0; i < infoService.getTicketCount(); i++) {
			if(this.persons[i].title.length == 0 || this.persons[i].lastName.length == 0 || this.persons[i].firstName.length == 0)
				return false;
		}
		return true;	
	}

	this.check = function() {
		if (!ctrl.checkValidForm()) {
		ctrl.showNotify('Vui lòng điền đầy đủ thông tin');
			return;
		} else {
			var info = infoService.getInfo();
			info.persons = this.persons;
			infoService.updateInfo(info);
			$state.go('verify');
		}
	};

	this.goHome = function() {
		$state.go('home');
	}
}]);

app.controller('SuccessCtrl',['$http', '$state', 'infoService', function($http, $state, infoService) {	
	var ctrl = this;

	this.info = infoService.getInfo();
	if (this.info.chuyenve != null){
		this.isRoundTrip = true;
	} else {
		this.isRoundTrip = false;
	}
	this.goHome = function() {
		$state.go('home');
	}
}]);