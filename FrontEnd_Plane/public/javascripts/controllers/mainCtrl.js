'use strict';
angular.module('planeApp')
.controller('MainCtrl',['$http', '$timeout', '$state', 'serverService', 'planeListService', 'infoService', 'errorService', 
							function($http, $timeout, $state, serverService, planeListService, infoService, errorService) {
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