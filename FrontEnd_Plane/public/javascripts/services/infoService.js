'use strict';
angular.module('planeApp')
.service('infoService', function() {
	this.info = {};

	this.updateInfo = function(data) {
		this.info = data;
	}

	this.getInfo = function() {
		return this.info;
	}

	this.setTicketCount = function(n) {
		this.info.sove = parseInt(n);
	}

	this.setDepartInfo = function(data) {
		this.info.chuyendi = data;
	}

	this.setArriveInfo = function(data) {
		this.info.chuyenve = data;
	}

	this.getTicketCount = function() {
		return this.info.sove;
	}

	this.setSumPrice = function(price) {
		this.info.price = price;
	}
});