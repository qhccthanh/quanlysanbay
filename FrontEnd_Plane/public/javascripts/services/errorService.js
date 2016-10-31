'use strict';
angular.module('planeApp')
.service('errorService', function() {
	var service = this;

	this.error = null;

	this.setError = function(err) {
		console.log('Error service: setError - ' + err);

		service.error = err;
	}

	this.getError = function() {
		console.log('Error service: getError - ' + service.error);

		return service.error;
	}
});