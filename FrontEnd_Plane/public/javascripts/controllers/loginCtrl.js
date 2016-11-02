'use strict';
angular.module('planeApp')
.controller('LoginCtrl', ['$http', '$timeout', function($http, $timeout) {
	var ctrl = this;

	this.notifyMsg = '';
	this.isNotify = false;

	this.username = '';
	this.password = '';

	this.showNotify = function(msg) {
		ctrl.notifyMsg = msg;
		ctrl.isNotify = true;
		$timeout(function() { ctrl.isNotify = false; ctrl.notifyMsg = ''; }, 2000);
	}

	this.checkValidInfo = function() {
		console.log(ctrl.username);
		console.log(ctrl.password);

		if (ctrl.username.length < 8 || ctrl.password.length < 8) {
			return false;
		}

		if ((ctrl.username.indexOf(' ') != -1) || (ctr.password.indexOf(' ') != -1)) {
			return false;
		}

		return true;
	}

	this.login = function() {
		console.log('login()');

		if (!ctrl.checkValidInfo()) {
			ctrl.showNotify('Thông tin chưa hợp lệ');
		}
	}
}]);