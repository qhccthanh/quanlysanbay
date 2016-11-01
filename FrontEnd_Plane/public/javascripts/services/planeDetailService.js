'use strict';
angular.module('planeApp')
.service('planeDetailService', function() {
	var service = this;

	this.plane = {};

	// false: update, delete
	// true: create
	this.mode = false;

	this.updateData = function(data) {
		service.plane = data;
	}

	this.getData = function() {
		return service.plane;
	}

	this.setIsCreate = function(mode) {
		service.mode = mode;
	}

	this.getIsCreate = function() {
		return service.mode;
	}
});