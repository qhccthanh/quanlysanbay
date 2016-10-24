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

console.log("call");

setInterval(function () {
    connection.query('SELECT 1');
}, 5000);

function getTicket(req,res,next) {
	console.log("call getTicket");
}

// BOOK vé với POST trả về mã đặt chỗ
function bookTicket(req,res,next) {
	console.log("bookTicket");
	console.log("body: " + req.swagger.params.datcho);

	var datcho = req.swagger.params.datcho.value.datcho;

	// Required
	var flightID = datcho.machuyenbay;
	var fromDateTimeStamp = datcho.ngaydi;
	var mucgia = datcho.mucgia;
	var hang = datcho.hang;
	var soghe = datcho.soghe; 

	var fromDate = dateformat(new Date(fromDateTimeStamp * 1000), "yyyy-mm-dd");

	
	var queryGiaVe = util.format("select giaban, soghe from chuyenbay where machuyenbay = \'%s\' and ngaydi = \'%s\' and hang = \'%s\' and muc = \'%s\' and soghe >= %d", flightID,fromDate, hang,mucgia, soghe);
	console.log("queryGiaVe: " + queryGiaVe);
	// Query giá vé
	connection.query(queryGiaVe, function(err, results) {
		try {
			if (!err) {
				if (results != undefined ) { 
					if (results.length == 0) {
						console.log(results);
						res.status(404).send({
							"message": "Không tìm thấy chuyến bay thoả yêu cầu"
						});
						return;
					} else {
						// Generate Ma dat cho va thoi cgian cap phát
						console.log(results);

						var madatcho = generateUUID.generate(6);
						var thoigiancapphat = dateformat(new Date(), "yyyy-mm-dd");

						// Insert mat đặt chỗ với trạng thái là 0
						var queryDatCho = util.format("INSERT INTO datcho(madatcho, thoigiandatcho, tongtien, trangthai) values(\'%s\',\'%s\',%d,%d)", madatcho, thoigiancapphat , results[0].giaban * soghe, 0);
						
						// Thêm vào chi tiết chuyến bay
						var queryChiTietChuyenBay = util.format("INSERT INTO chitietchuyenbay(madatcho, machuyenbay, ngay, hang, mucgia) values(\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')",madatcho,flightID,fromDate,hang,mucgia);

						// Cập nhật chỗ
						var queryUpdateChuyenBay = util.format("UPDATE chuyenbay SET soghe = %d where machuyenbay = \'%s\' and ngaydi = \'%s\' and hang = \'%s\' and muc = \'%s\'", results[0].soghe - soghe,flightID,fromDate,hang,mucgia );

						console.log("queryDatCho: " + queryDatCho);
						

						// Query đặt chỗ
						connection.query(queryDatCho, function(err,results) {

							// Nếu k có error insert vào chi tiết chuyến bay và trừ số ghế
							if(!err) {

								console.log("queryChiTietChuyenBay: " + queryChiTietChuyenBay);
								connection.query(queryChiTietChuyenBay, function(err,results) {
									// Nếu k có lỗi gửi thông tin đặt chỗ 
									if(!err) {

										console.log("queryUpdateChuyenBay " + queryUpdateChuyenBay);
										connection.query(queryUpdateChuyenBay, function(err,results) {
											if (err) {
												console.log(err);
											}
										});

										var dateGenerate =  (new Date()).getTime();
										res.send({
											"datcho" : {
												"madatcho": madatcho,
												"machuyenbay": flightID,
												"ngaydi": fromDate,
												"thoigiancapphat": dateGenerate,
												"thoihansudung": 5*60*1000 + dateGenerate
											}
										});
									}
									// Nếu có lỗi xoá đặt chỗ và gửi lỗi 
									else {
										res.status(404).send({
											"message": "Có lỗi xãy ra trong lúc thêm chi tiết chuyến bay"
										});

										var queryDeleteDatCho = util.format("DELETE FROM datcho where madatcho = \'%s\'",madatcho);
										console.log("queryDeleteDatCho: " + queryDeleteDatCho); 

										connection.query(queryDeleteDatCho, function(err,results) {
											if (err) {
												console.log(err);
											}
										});
									}
								});
							} else {
								res.status(404).send({
									"message": "Có lỗi xãy ra trong lúc thêm đặt chỗ"
								});

								console.log(err);
							}
						});
					} }
			} else {
				res.status(404).send({
					"message": "Có lỗi xãy ra vui lòng kiểm tra lại điều kiện"
				});
			}
		} catch (e) {
			res.status(404).send({
				"message": "Có lỗi xãy ra vui lòng kiểm tra lại điều kiện"
			});
			console.log(e);
		}
	});
}

function updateInfoTicket(req,res,nxet) {

	var madatcho = req.swagger.params.madatcho.value;
	
}

function getBookInfo(req,res,next) {

}
