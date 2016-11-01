'use strict';
angular.module('planeApp')
.controller('UpdatePlaneCtrl', ['$http', '$state', '$timeout', 'planeDetailService', 'errorService', 'serverService', 'timeService'
								, function($http, $state, $timeout, planeDetailService, errorService, serverService, timeService) {
	var ctrl = this;

	this.plane = {};
	this.airportList = [];

	this.isNotify = false;
	this.notifyMsg = '';

	this.defaultTypeArray = ['C', 'Y'];
	this.defaultCostArray = ['E', 'F', 'G'];
	
	this.departTime = null;
	this.departDate = null;

	this.isCreateMode = false;

	this.showNotify = function(msg) {
		ctrl.notifyMsg = msg;
		ctrl.isNotify = true;
		$timeout(function() { ctrl.isNotify = false; ctrl.notifyMsg = ''; }, 2000);
	}

	this.init = function() {
		var reqUrl = serverService.getServer() + '/sanbay?truong=city';

		$http.get(reqUrl).success(function(data) {
			ctrl.airportList = data.sanbay;
		});

		ctrl.plane = planeDetailService.getData();
		
		ctrl.departTime = ctrl.plane.giodi;
		ctrl.departDate = timeService.getDateFromString(ctrl.plane.ngaydi);

		ctrl.isCreateMode = planeDetailService.getIsCreate();
	}

	this.init();

	this.getCurrentDate = function() {
		var curDate = new Date();
		var res = curDate.getTime();

		res -= (curDate.getHours() * 3600 + curDate.getMinutes() * 60 + curDate.getSeconds()) * 1000 + curDate.getMilliseconds();

		return res / 1000;
	}

	this.dateChanged = function() {
		var curDate = ctrl.getCurrentDate();

		ctrl.plane.ngaydi = ctrl.departDate.getTime() / 1000;

		if (ctrl.plane.ngaydi < curDate) {
			ctrl.departDate = null;
			ctrl.showNotify('Ngày đi không hợp lệ');

			ctrl.plane.ngaydi = 0;
		}
	}

	this.timeChanged = function() {
		ctrl.plane.giodi = timeService.getTimeFromDate(ctrl.departTime);
	}

	this.seatChanged = function() {
		if (ctrl.plane.soghe < 20 || ctrl.plane.soghe > 150) {
			ctrl.plane.soghe = 0;

			ctrl.showNotify('Số ghế >= 20 và <= 150');
		}
	}

	this.costChanged = function() {
		if (ctrl.plane.giaban < 500000 || ctrl.plane.giaban > 15000000) {
			ctrl.plane.giaban = 0;

			ctrl.showNotify('Giá bán >= 500.000 và <= 15.000.000');	
		}
	}

	this.checkValidInfo = function() {
		if (ctrl.plane.machuyenbay == null
			|| ctrl.plane.masanbaydi == null
			|| ctrl.plane.masanbayden == null
			|| ctrl.plane.ngaydi == null
			|| ctrl.plane.giodi == null
			|| ctrl.plane.hang == null
			|| ctrl.plane.muc == null
			|| ctrl.plane.soghe == null
			|| ctrl.plane.giaban == null) {
			return false;
		}

		if (typeof(ctrl.plane.machuyenbay) == 'undefined'
			|| typeof(ctrl.plane.masanbaydi) == 'undefined'
			|| typeof(ctrl.plane.masanbayden) == 'undefined'
			|| typeof(ctrl.plane.ngaydi) == 'undefined'
			|| typeof(ctrl.plane.giodi) == 'undefined'
			|| typeof(ctrl.plane.hang) == 'undefined'
			|| typeof(ctrl.plane.muc) == 'undefined'
			|| typeof(ctrl.plane.soghe) == 'undefined'
			|| typeof(ctrl.plane.giaban) == 'undefined') {
			return false;
		}

		if (ctrl.plane.machuyenbay == null || ctrl.plane.machuyenbay.length == 0) {
			return false;
		}

		if (ctrl.plane.ngaydi == 0 || ctrl.plane.soghe == 0 || ctrl.plane.giaban == 0) {
			return false;
		}

		return true;
	}

	this.goBack = function() {
		$state.go('planeListAdmin');
	}

	this.create = function() {
		console.log(ctrl.plane);

		if (!ctrl.checkValidInfo()) {
			ctrl.showNotify('Thông tin chưa hợp lệ');
		}
	}

	this.delete = function() {
		console.log(ctrl.plane);

		if (!ctrl.checkValidInfo()) {
			ctrl.showNotify('Thông tin chưa hợp lệ');
		}
	}

	this.update = function() {
		console.log(ctrl.plane);

		if (!ctrl.checkValidInfo()) {
			ctrl.showNotify('Thông tin chưa hợp lệ');
		}
	}
}]);