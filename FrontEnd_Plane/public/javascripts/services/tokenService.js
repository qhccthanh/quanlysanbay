'use strict';
angular.module('planeApp')
.service('tokenService', function() {
	var service = this;

	this.token = null;

	this.setToken = function(data) {
		service.token = data;
	}
	this.getToken = function() {
		return service.token;
	}
});