'use strict';
angular.module('planeApp')
.controller('VerifyCtrl',['$http', '$state', '$timeout', 'infoService','serverService', 'errorService', function($http, $state, $timeout, infoService, serverService, errorService) {
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