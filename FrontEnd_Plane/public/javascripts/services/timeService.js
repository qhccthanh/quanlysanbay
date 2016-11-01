'use strict';
angular.module('planeApp')
.service('timeService', function() {
	this.getDateFromString = function(timeString) {
		var str = (timeString || "").replace(/-/g,"/").replace(/[TZ]/g," ");
		var findDot = str.search(".000");
		console.log(str.substring(findDot, 0));
		var dateD = new Date(str.substring(findDot, 0));

		return dateD;
	}

	this.getTimeFromDate = function(date) {
		return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
	}
});