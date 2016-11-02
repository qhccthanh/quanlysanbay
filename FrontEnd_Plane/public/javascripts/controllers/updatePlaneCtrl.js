'use strict';
angular.module('planeApp')
.controller('UpdatePlaneCtrl', ['$http', '$state', '$timeout', 'planeDetailService', 'errorService', 'serverService', 'timeService', 'auth'
								, function($http, $state, $timeout, planeDetailService, errorService, serverService, timeService, auth) {
	
	if (auth.isLoggedIn() == false){
		$state.go('login');
	}

	var ctrl = this;

	this.plane = {};
	this.airportList = [];

	this.isNotify = false;
	ctrl.isShowResult = false;
	this.notifyMsg = '';
	this.resultMsg = '';

	this.defaultTypeArray = ['C', 'Y'];
	this.defaultCostArray = ['E', 'F', 'G'];
	
	this.departTime = null;
	this.departDate = null;

	this.isCreateMode = false;

	this.oldData = {};

	this.showNotify = function(msg) {
		ctrl.notifyMsg = msg;
		ctrl.isNotify = true;
		$timeout(function() { ctrl.isNotify = false; ctrl.notifyMsg = ''; }, 2000);
	}

	this.showResult = function(msg) {
		ctrl.resultMsg = msg;
		ctrl.isShowResult = true;
		$timeout(function() { ctrl.isShowResult = false; ctrl.resultMsg = ''; }, 2000);
	}

	this.cloneObj = function(obj) {
	    var copy;

	    // Handle the 3 simple types, and null or undefined
	    if (null == obj || "object" != typeof obj) return obj;

	    // Handle Date
	    if (obj instanceof Date) {
	        copy = new Date();
	        copy.setTime(obj.getTime());
	        return copy;
	    }

	    // Handle Array
	    if (obj instanceof Array) {
	        copy = [];
	        for (var i = 0, len = obj.length; i < len; i++) {
	            copy[i] = ctrl.cloneObj(obj[i]);
	        }
	        return copy;
	    }

	    // Handle Object
	    if (obj instanceof Object) {
	        copy = {};
	        for (var attr in obj) {
	            if (obj.hasOwnProperty(attr)) copy[attr] = ctrl.cloneObj(obj[attr]);
	        }
	        return copy;
	    }

	    throw new Error("Unable to copy obj! Its type isn't supported.");
	}

	this.init = function() {
		var reqUrl = serverService.getServer() + '/sanbay?truong=city';

		$http.get(reqUrl).success(function(data) {
			ctrl.airportList = data.sanbay;
		});

		ctrl.plane = planeDetailService.getData();

		ctrl.oldData = ctrl.cloneObj(ctrl.plane);
		ctrl.oldData.currentTime = timeService.getDateFromString(ctrl.oldData.ngaydi).getTime()/1000 + 25200;
		
		ctrl.departDate = timeService.getDateFromString(ctrl.plane.ngaydi);
		ctrl.departTime = ctrl.plane.giodi;
		ctrl.isCreateMode = planeDetailService.getIsCreate();
	}

	this.init();

	this.logout = function() {
		auth.logOut();
		$state.go('login');	
	}

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
		ctrl.plane.giodi = ctrl.departTime;
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
			console.log("validate_data_null");
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
			console.log("validate_data_undefined");
			return false;
		}

		if (ctrl.plane.machuyenbay == null || ctrl.plane.machuyenbay.length == 0) {
			console.log("validate_machuyenbay_error");
			return false;
		}

		if (ctrl.plane.ngaydi == 0 || ctrl.plane.soghe == 0 || ctrl.plane.giaban == 0) {
			console.log("validate_time_error");
			return false;
		}

		if (ctrl.plane.soghe < 20 || ctrl.plane.soghe > 150) {
			console.log("validate_soghe_error");
			ctrl.showNotify('Số ghế >= 20 và <= 150');
			return false;
		}
		if (ctrl.plane.giaban < 100000 || ctrl.plane.giaban > 15000000) {
			console.log("validate_giaban_error");
			ctrl.showNotify('Giá bán >= 200.000 và <= 15.000.000');	
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
		} else {
			console.log("create");
			var flight = {
				"chuyenbay": {
					"machuyenbay": ctrl.plane.machuyenbay,
				    "masanbaydi": ctrl.plane.masanbaydi,
				    "masanbayden": ctrl.plane.masanbayden,
				    "ngaydi": ctrl.departDate.getTime()/1000 + 25200,
				    "hang": ctrl.plane.hang,
				    "muc": ctrl.plane.muc,
				    "soghe": "" + ctrl.plane.soghe,
				    "giaban": "" + ctrl.plane.giaban				
				}
			};
			if (typeof(ctrl.plane.giodi) == 'string') {
				var a = ctrl.plane.giodi.split(':'); 
				var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
				flight.chuyenbay.giodi = seconds;
			} else {
				flight.chuyenbay.giodi = timeService.getTimeFromDate(ctrl.plane.giodi);
			}
			var reqURL = serverService.getServer() + '/chuyenbay?token=' + auth.getToken();
   			$http.post(reqURL, flight).success(function(data) {
      			console.log(data);
      			console.log('Tao thanh cong');
      			ctrl.showResult('Tạo thành công');
    		}).error(function(error) {
				$state.go('login');
			});
		}
	}

	this.delete = function() {
		console.log(ctrl.plane);

		if (!ctrl.checkValidInfo()) {
			ctrl.showNotify('Thông tin chưa hợp lệ');
		} else {
			var reqURL = serverService.getServer() + '/chuyenbay?token=' + auth.getToken();
			var reqURL = reqURL + '&ngaydi=' +ctrl.oldData.currentTime
			 + '&hang=' + ctrl.oldData.hang + '&mucgia=' + ctrl.oldData.muc + '&machuyenbay=' + ctrl.oldData.machuyenbay 
			 + '&masanbaydi=' + ctrl.oldData.masanbaydi + '&masanbayden=' + ctrl.oldData.masanbayden;
   			$http.delete(reqURL).success(function(data) {
      			console.log(reqURL);
      			console.log("xoa thanh cong");
      			ctrl.showResult('Xóa thành công');
    		}).error(function(error) {
				$state.go('login');
			});
		}
	}

	this.update = function() {
		console.log(ctrl.plane);

		if (!ctrl.checkValidInfo()) {
			ctrl.showNotify('Thông tin chưa hợp lệ');
		} else {

			var flight = {
				"chuyenbay": {
					"machuyenbay": ctrl.plane.machuyenbay,
				    "masanbaydi": ctrl.plane.masanbaydi,
				    "masanbayden": ctrl.plane.masanbayden,
				    "ngaydi": ctrl.departDate.getTime()/1000 + 25200,
				    "hang": ctrl.plane.hang,
				    "muc": ctrl.plane.muc,
				    "soghe": "" + ctrl.plane.soghe,
				    "giaban": "" + ctrl.plane.giaban				
				}
			};
			if (typeof(ctrl.plane.giodi) == 'string') {
				var a = ctrl.plane.giodi.split(':'); 
				var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
				flight.chuyenbay.giodi = seconds;
			} else {
				flight.chuyenbay.giodi = timeService.getTimeFromDate(ctrl.plane.giodi);
			}
			
			console.log("Post data:");
			console.log(flight);
			var reqURL = serverService.getServer() + '/chuyenbay?token=' + auth.getToken();
			var reqURL = reqURL + '&ngaydi=' + ctrl.oldData.currentTime
			 + '&hang=' + ctrl.oldData.hang + '&mucgia=' + ctrl.oldData.muc + '&machuyenbay=' + ctrl.oldData.machuyenbay 
			 + '&masanbaydi=' + ctrl.oldData.masanbaydi + '&masanbayden=' + ctrl.oldData.masanbayden;
   			$http.put(reqURL, flight).success(function(data) {
      			console.log(reqURL);
      			console.log(data);
      			console.log("update thanh cong");
      			ctrl.showResult('Update thành công');
    		}).error(function(error) {
				$state.go('login');
			});
		}
	}
}]);