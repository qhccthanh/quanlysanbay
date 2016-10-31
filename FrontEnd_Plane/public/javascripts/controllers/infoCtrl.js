'use strict';
angular.module('planeApp')
.controller('InfoCtrl',['$http', '$timeout', '$state','infoService', function($http, $timeout, $state, infoService) {
	
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