'use strict';
angular.module('planeApp')
.service('serverService', function() {
	var service = this;

	this.server = 'http://139.162.58.193:10011';

	this.getServer = function() {
		return service.server;
	}
});