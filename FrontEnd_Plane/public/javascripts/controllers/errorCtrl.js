'use strict';
angular.module('planeApp')
.controller('ErrorCtrl',['$http', '$state', 'errorService', function($http, $state, errorService) {
	var ctrl = this;
	this.error = errorService.getError();

	this.goHome = function() {
		$state.go('home');
	}
}]);