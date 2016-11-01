'use strict';
angular.module('planeApp')
.controller('SuccessCtrl',['$http', '$state', 'infoService', function($http, $state, infoService) {	
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