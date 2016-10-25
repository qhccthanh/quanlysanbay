'user strict'

var util = require("util");
var fs = require("fs");
var mysql = require("mysql");
var dateformat = require("dateformat");

var generateUUID = require(__dirname + "/helper/" + "generateUUID");
var helper = require(__dirname + "/helper/" + "helper");

module.exports = {
	getBooks,
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

// GET /datcho
function getBooks(req,res,next) {
	console.log("call getBooks");

	var machuyenbay = req.swagger.params.machuyenbay.value;
	var ngaydi = req.swagger.params.ngaydi.value;
	var hang = req.swagger.params.hang.value;
	var muc = req.swagger.params.mucgia.value;

	var queryBooks = "SELECT dc.madatcho,ctcb.machuyenbay,DATE_FORMAT(ctcb.ngay,\'%Y-%m-%d\') as ngay,ctcb.hang,ctcb.mucgia,dc.tongtien,dc.trangthai FROM datcho dc join chitietchuyenbay ctcb on (ctcb.madatcho = dc.madatcho) WHERE 1"

	if (machuyenbay != undefined) {
		queryBooks += " AND ctcb.machuyenbay = \'" + machuyenbay + "\'";
	}

	if (ngaydi != undefined) {
		
		var fromDate = dateformat(ngaydi, "yyyy-mm-dd");
		queryBooks += " AND ctcb.ngay = \'" + fromDate + "\'";
	}

	if (hang != undefined) {
		queryBooks += " AND ctcb.hang = \'" + hang + "\'";
	}

	if (muc != undefined) {
		queryBooks += " AND ctcb.mucgia = \'" + muc + "\'";
	}

	console.log("queryBooks: " + queryBooks);

	connection.query(queryBooks, function(error,results) {
		if(error) {
			res.status(404).send({'message': "Có lỗi xãy ra trong lúc lấy dữ liệu vui lòng thử lại."});
			console.log(error);
		} else {
			if (results.length == 0) {
				res.status(404).send({'message': "Không có dữ liệu"});
			}
			var arrayObject = [];

			for(var i = 0 ; i < results.length; i++) {
				var item = results[i];
				var keys = Object.keys(item);
				
				var object = {};

				for(var j = 0 ; j < keys.length; j++) {
					var key = keys[j];
					object[key] = item[key];
				}

				console.log(object["ngay"]);
				var ngay = (new Date(object["ngay"])).getTime();
				object.ngay = ngay;

				arrayObject.push(object);
			}

			console.log(arrayObject);
			res.send({
				"datcho": arrayObject
			});
		}
	});
}

var bookIDKeepValiable = [];

// BOOK vé với POST trả về mã đặt chỗ
// POST /datcho
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



//GET /datcho/{madatcho}/
function getBookInfo(req,res,next) {
	var madatcho = req.swagger.params.madatcho.value;
	var queryString = util.format("SELECT dc.madatcho, ctcb.machuyenbay, ctcb.ngay, ctcb.hang, ctcb.mucgia, dc.soghe, dc.tongtien, dc.trangthai from datcho dc join chitietchuyenbay ctcb on (dc.madatcho = ctcb.madatcho) WHERE dc.madatcho = \'%s\' ", madatcho);

	console.log("Select DatCho: " + queryString);
	connection.query(queryString, function(error,results) {
		if(error) {
			res.status(404).send({
				"message": "Có lỗi xãy ra vui lòng thử lại"
			});
			console.log(error);
		} else {
			if(results.length == 0) {
				res.status(404).send({
					"message": "Mã đặt chỗ không tồn tại hoặc đã quá hạn"
				});
			} else {
				var item = results[0];
				var keys = Object.keys(item);
				
				var resResult = {};

				for(var j = 0 ; j < keys.length; j++) {
					var key = keys[j];
					resResult[key] = item[key];
				}

				console.log(resResult["ngay"]);
				var ngay = (new Date(resResult["ngay"])).getTime();
				resResult.ngay = ngay;

				var hanhKachQuery =  util.format("SELECT * FROM hanhkhach WHERE madatcho = \'%s\'", madatcho);

				console.log("hanhKachQuery: " + hanhKachQuery);
				connection.query(hanhKachQuery, function(error,results) {
					if(error) {
						res.status(404).send({
							"message": "Có lỗi xãy ra vui lòng thử lại"
						});
						console.log(error);
					} else {
						var hkArray = [];
						for(var i = 0 ; i < results.length; i++) {
							var item = results[i];
							var keys = Object.keys(item);
							var object = {}

							for(var j = 0; j < keys.length; j++) {
								var key = keys[j];
								object[key] = item[key];
							}

							hkArray.push(object);
						}

						resResult["hanhkhach"] = hkArray;
						res.send({
							"datcho" : results
						});
					}
				});
			}
		}
	});

}

//PUT /datcho
function updateInfoTicket(req,res,nxet) {
	console.log("bookTicket");
	console.log("body: " + req.swagger.params.datcho);

	var datcho = req.swagger.params.datcho.value.datcho;

	var madatcho = datcho.madatcho;
	var hanhkhach = datcho.hanhkhach;

	try {
		if( hanhkhach.length == 0) {
			res.status(404).send({
				"message": "Danh sách hành khách rỗng"
			});
		} else {
			var queryString = util.format("SELECT * from datcho WHERE madatcho = \'%s\' ", madatcho);

			console.log(queryString);
			connection.query(queryString,function(error,results){
				if(error){
					res.status(404).send({
						"message": "Có lỗi xãy ra vui lòng thử lại"
					});
				} else {
					if(results.length == 0 ){
						res.status(404).send({
							"message": "Mã đặt chỗ không tồn tại hoặc đã quá hạn"
						});
					} else {
						var item = results[0];
						
						// Update State = 1
						var updateStateDatChoQuery = util.format("UPDATE datcho SET trangthai = 1 WHERE madatcho = \'%s\'", madatcho);
						console.log("updateStateDatChoQuery: " + updateStateDatChoQuery);
						connection.query(updateStateDatChoQuery, function(error,results) {
							if(error) {
								console.log(error);
								res.status(404).send({
									"message": "Có lỗi xãy ra vui lòng thử lại"
								});
							} else {
								// Insert tung hành khách vào database
								var currentHKComplete = 0;
								var hkCount = hanhkhach.length;

								hanhkhach.forEach(function(hk) {
									console.log("INSERT INTO hanhkhach values hk");

									connection.query("DELETE FROM hanhkhach where madatcho = ? and danhxung = ? and ho = ? and ten = ?", [madatcho, hk.danhxung, hk.ho, hk.ten] , function(error,results) {
										connection.query("INSERT INTO hanhkhach values(?,?,?,?)", [madatcho, hk.danhxung, hk.ho, hk.ten] , function(error,results) {
											currentHKComplete += 1;
											if(error) {
												console.log(error);
												res.status(404).send({
													"message": "Có lỗi xãy ra vui lòng thử lại"
												}).end();
											} else {
												console.log("currentHKComplete: " + currentHKComplete);
												console.log("hkCount: " + hkCount);
												if(currentHKComplete == hkCount) {
													// Query lại toàn bộ thông tin vé trả về client
													var queryString = util.format("SELECT dc.madatcho, cb.machuyenbay, cb.masanbaydi, cb.masanbayden, cb.ngaydi, cb.giodi, cb.hang, cb.muc,dc.soghe,dc.tongtien, dc.trangthai FROM datcho dc join chitietchuyenbay ctcb on (dc.madatcho = ctcb.madatcho) join chuyenbay cb on (ctcb.machuyenbay = cb.machuyenbay and ctcb.ngay = cb.ngaydi) WHERE dc.madatcho = \'%s\'", madatcho);

													console.log("Get ValidationDataBook: " + queryString);
													connection.query(queryString, function(err,results){
														if(err) {
															res.status(404).send({
																"message": "Có lỗi xãy ra vui lòng thử lại"
															}).end();
															console.log(err);
														} else {
															if (results.length == 0) {
																res.status(404).send({
																	"message": "Có lỗi xãy ra vui lòng thử lại"
																}).end();
															} else {
																
																var item = results[0];
																var keys = Object.keys(item);
																
																var object = {};

																for(var j = 0 ; j < keys.length; j++) {
																	var key = keys[j];
																	object[key] = item[key];
																}

																console.log(object["ngaydi"]);
																var ngay = (new Date(object["ngaydi"])).getTime();
																object.ngay = ngay;

																object["hanhkhach"] = hanhkhach;

																console.log(object);
																res.send({
																	'datcho': object
																});
																
															}
														}
													});
												}
											}
										});
									});

									
								});
							}
						});
						// Insert hanh khach

					}
				}
			});
		}
	} catch (e) {
		res.status(404).send({
			"message": "Có lỗi xãy ra vui lòng thử lại"
		});
	}
	
}


















