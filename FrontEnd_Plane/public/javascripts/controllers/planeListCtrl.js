'use strict';
angular.module('planeApp')
.controller('PlaneListCtrl',['$http', '$state', 'serverService', 'planeListService', 'infoService', 'errorService',
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