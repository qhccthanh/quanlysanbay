'use strict';
angular.module('planeApp')
.controller('LoginCtrl', ['$http', '$timeout', 'serverService', 'errorService', 'auth', '$state', function($http, $timeout, serverService, errorService, auth, $state) {
	var ctrl = this;

	if (auth.isLoggedIn() == true){
		$state.go('planeListAdmin');
	}


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

		if (ctrl.username.length < 3 || ctrl.password.length < 3) {
			return false;
		}

		if ((ctrl.username.indexOf(' ') != -1) || (ctrl.password.indexOf(' ') != -1)) {
			return false;
		}

		return true;
	}

	this.login = function() {
		console.log('login()');

		if (!ctrl.checkValidInfo()) {
			ctrl.showNotify('Thông tin chưa hợp lệ');
		} else {
			var reqURL = serverService.getServer() + '/chungthuc';

			var body = {
				"user": {
					"username": ctrl.username,
					"password": ctrl.password
				}
			};

			auth.logIn(body).error(function(error) {
				console.log(error);
			}).then(function() {
				$state.go('planeListAdmin');
			});
		}
	}
}]);