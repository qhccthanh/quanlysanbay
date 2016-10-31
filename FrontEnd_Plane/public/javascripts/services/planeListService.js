'use strict';
angular.module('planeApp')
.service('planeListService', function() {
	var service = this;

	this.planeList = {};
	this.isRoundTrip = false;

	this.updatePlaneList = function(data, isRoundTrip) {
		service.planeList = {};
		service.isRoundTrip = isRoundTrip;

		if (data != null) {
			service.planeList = data.chuyenbay;
		}

		console.log('planeListService:');
		console.log(service.planeList);
	}

	this.getDepartList = function() {
		return service.planeList.chuyendi;
	}

	this.getArriveList = function() {
		return service.planeList.chuyenve;
	}

	this.getIsRoundTrip = function() {
		return service.isRoundTrip;
	}
});