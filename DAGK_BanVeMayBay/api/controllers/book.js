'user strict'

var util = require("util");
var fs = require("fs");
var mysql = require("mysql");
var dateformat = require("dateformat");

var generateUUID = require(__dirname + "/helper/" + "generateUUID");
var helper = require(__dirname + "/helper/" + "helper");

module.exports = {
	getTicket,
	bookTicket,
	updateInfoTicket,
	getBookInfo,
};

var connection = mysql.createConnection({
  host     : '166.62.10.228',
  user     : 'qhct',
  password : 'qhct@123',
  database : 'quanlychuyenbay'
});

connection.connect();

setInterval(function () {
    connection.query('SELECT 1');
}, 5000);

function getTicket(res,req,next) {

}

// BOOK vé với POST trả về mã đặt chỗ
function bookTicket(res,req,next) {

	// Required
	var flightID = req.swagger.params.machuyenbay.value;
	var fromDateTimeStamp = req.swagger.params.ngaydi.value;
	var mucgia = req.swagger.params.muc.value;
	var hang = req.swagger.params.hang.value;
	var soghe = req.swagger.params.soghe.value; 

	var fromDate = dateformat(new Date(fromDateTimeStamp * 1000), "yyyy-mm-dd");

	
	var queryGiaVe = util.format("select giaban from chuyenbay where machuyenbay = \'%s\' and ngaydi = \'%s\' and hang = \'%s\' and muc = \'%s\'", "CF108","2016/10/20","C","F");

	connection.query(queryGiaVe, function(err, results) {
		try {
			if (!err) {
				if (results != undefined ) { 
					if (results.length == 0) {
						res.sendStatus(404);
					} else {
						console.log(results);
						var madatcho = generateUUID.generate(6);
						var thoigiancapphat = dateformat(new Date(), "yyyy-mm-dd");
						var queryDatCho = util.format("INSERT INTO DATCHO(madatcho, thoigiandatcho, tongtien, trangthai) values(\'%s\',\'%s\',%d,%d)", madatcho, thoigiancapphat , results[0].giaban * soghe, 0);
						
						var queryChiTietChuyenBay = util.format("INSERT INTO chitietchuyenbay(madatcho, machuyenbay, ngay, hang, mucgia) values(\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')",madatcho,flightID,fromDate,hang,mucgia);

						console.log(queryDatCho);
						console.log(queryChiTietChuyenBay);

						connection.query(queryDatCho, function(err,results) {

							if(!err) {
								con
								connection.query(queryChiTietChuyenBay, function(err,results) {
									if(!err) {
										res.send({
											"datcho" : {
												"madatcho": madatcho,
												"machuyenbay": machuyenbay,
												"ngaydi": fromDate,
												"thoigiancapphat": thoigiancapphat,
												"thoihansudung": 5*60*1000
											}
										});
									} else {
										res.sendStatus(404);
										var queryDeleteDatCho = util.format("DELETE FROM datcho where madatcho = \'%s\'",madatcho);
										console.log(queryDeleteDatCho); 

										connection.query(queryDeleteDatCho, function(err,results) {
											if (!err) {
												console.log(err);
											}
										});
									}
								});
							} else {
								res.sendStatus(404);
							}
						});
					} }
			} else {
				res.sendStatus(404);
				console.log(err);
			}
		} catch (e) {
			res.sendStatus(404);
		}
	});
}

function updateInfoTicket(res,req,nxet) {

	var madatcho = req.swagger.params.madatcho.value;
	
}

function getBookInfo(res,req,next) {
	
}
