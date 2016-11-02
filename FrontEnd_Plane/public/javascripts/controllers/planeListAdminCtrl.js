'use strict';
angular.module('planeApp')
.controller('PlaneListAdminCtrl', ['$http', '$state', '$timeout', 'serverService', 'planeDetailService', 'auth'
									, function($http, $state, $timeout, serverService, planeDetailService, auth) {
	var ctrl = this;

	if (auth.isLoggedIn() == false){
		$state.go('login');
	}

	this.planeList = [];

	this.notifyMsg = '';
	this.isNotify = false;

	this.showNotify = function(msg) {
		ctrl.notifyMsg = msg;
		ctrl.isNotify = true;
		$timeout(function() { ctrl.isNotify = false; ctrl.notifyMsg = ''; }, 2000);
	}

	this.init = function() {
		var reqUrl = serverService.getServer() + '/chuyenbay';

		console.log('init()');
		console.log(reqUrl);

		$http.get(reqUrl).success(function(data) {
			if (data != null) {
				ctrl.planeList = data.chuyenbay.chuyendi;
			}
		}).error(function(err) {
			ctrl.showNotify('Có lỗi xảy ra. Vui lòng thử lại sau!')
		});
	}

	this.init();

	this.planeClick = function(id) {
		planeDetailService.updateData(ctrl.planeList[id]);
		planeDetailService.setIsCreate(false);
		$state.go('updatePlane');
	}

	this.create = function() {
		planeDetailService.updateData({});
		planeDetailService.setIsCreate(true);
		$state.go('updatePlane');	
	}

	this.logout = function() {
		auth.logOut();
		$state.go('login');	
	}
}]);