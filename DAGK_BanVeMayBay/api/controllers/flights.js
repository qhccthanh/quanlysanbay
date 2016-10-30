
'user strict'

var util = require("util");
var fs = require("fs");
var mysql = require("mysql");
var dateformat = require("dateformat");

var generateUUID = require(__dirname + "/helper/" + "generateUUID");
var helper = require(__dirname + "/helper/" + "helper");

module.exports = {
	getFlight,
	getFlightInfo,
	insertFlight,
	deleteFlight,
	updateFlight,
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

// Tìm kiếm chuyến bay
// GET chuyenbay/?
function getFlight(req,res,next) {

	
	var fromID = req.swagger.params.masanbaydi.value;
	var toID = req.swagger.params.masanbayden.value;
	var fromTimeStamp = req.swagger.params.ngaydi.value; 

	// Optional
	var toTimeStamp = req.swagger.params.ngayve.value;
	var hangVe = req.swagger.params.hang.value; 
	var mucgia = req.swagger.params.mucgia.value; 
	var soluongghe = req.swagger.params.soluongghe.value; 
	var batdau = req.swagger.params.batdau.value; 
	var ketthuc = req.swagger.params.ketthuc.value; 

	var fromDate = "2016-05-16";

	var queryString = "SELECT * from chuyenbay where ( 1 ";
	var nBatDau = 0;
	var nKetThuc = 50 ;

	if (batdau != undefined && batdau > 0) {
		nBatDau = batdau;
	}

	if (ketthuc != undefined && ketthuc > 0 ) {
		nKetThuc = ketthuc - nBatDau;
	}

	var limitString = util.format("LIMIT %d,%d", nBatDau, nKetThuc);
	console.log(limitString);
	var tempQuery = " ";

	if (fromID != undefined) {
		tempQuery += " AND masanbaydi = \'" + fromID + "\'";
	}

	if (toID != undefined) {
		tempQuery += " AND masanbayden = \'" + toID + "\'";
	}

	if (fromTimeStamp != undefined) {
		fromDate = dateformat(new Date(fromTimeStamp * 1000), "yyyy-mm-dd");
		tempQuery += " AND ngaydi = " + fromDate ;
	}

	if (hangVe != undefined) {
		tempQuery += " AND hang = \'" + hangVe + "\'";
	}

	if (mucgia != undefined) {
		tempQuery += " AND muc = \'" + mucgia + "\'";
	}

	if (soluongghe != undefined) {
		tempQuery += " AND soghe >= " + soluongghe ;
	}

	queryString += (tempQuery + " ) " + limitString);

	if (toTimeStamp != undefined) {

		var toDate = dateformat(new Date(toTimeStamp * 1000), "yyyy-mm-dd");

		queryString += " OR ( masanbaydi = \'" + toID + "\' AND masanbayden = \'" + fromID + "\' AND ngaydi = \'" + toDate + "\'";

		queryString += (tempQuery + ") " + limitString);
	}

	console.log(queryString);

	connection.query(queryString, function(err,results) {
		
		if (!err) {
			//console.log(results);

			if (results.length == 0) {
				res.status(404).send({"message": "Không có chuyến bay nào"});
				return;
			}

			var values = [];
			results.forEach(function(item) {

				var itemKeys = Object.keys(item);
				var object = {};

				itemKeys.forEach(function(key) {
					object[key] = item[key];
				});
			//	console.log(object);
				values.push(object);
			});

			console.log("results: " + values);

			res.send({
				"chuyenbay": {
					"chuyendi": values,
					"chuyenve": []
				} 
			});	
		} else {
			res.status(404).send({"message": "Có lỗi xãy ra vùi lòng thử lại"});
		}
	});
}

// Lấy thông tin chuyên bay với mã chuyến bay và ngày đi
// GET chuyenbay/{machuyenbay}/?truong=[]
function getFlightInfo(req,res,next) {

	// GET PARAMETER
	// Required
	var flightID = req.swagger.params.machuyenbay.value;
	var fromDateTimeStamp = req.swagger.params.ngaydi.value;
	
	// Optional
	var fieldsString = req.swagger.params.truong.value;

	var fromDate = dateformat(new Date(fromDateTimeStamp * 1000), "yyyy-mm-dd");

	var queryParam = "";
	var isQueryPassenger = false;
	// IF FIELDS NOT UNDEFINED
	if (fieldsString != undefined) {
		var fields = fieldsString.split(",");

		try {
			for (var i = 0; i < fields.length; i++) {

				if (!fields[i].localeCompare("hanhkhach")) {
					isQueryPassenger = true;
					continue;
				}

				if (!fields[i].localeCompare("ngaydi")) {
					 // DATE_FORMAT(datecolumn,'%d/%m/%Y')
					queryParam += " DATE_FORMAT("+fields[i]+",\'%Y/%m/%d\') as ngaydi"
					console.log(queryParam);
				} else {
					queryParam += fields[i] 
				}
				
				if (i + 1 != fields.length) {
					queryParam += ",";
				}
			}

		} catch (e) {
			queryParam = "*";
			res.sendStatus(404);
			console.log(e);
			return;
		}

		if (queryParam[queryParam.length-1] == ',') {
			queryParam = queryParam.substring(0, queryParam.length-1);
		}
	} else {
		queryParam = "*";
	}

	var queryString = "SELECT " + queryParam + " FROM chuyenbay where machuyenbay = \'" + flightID + "\' AND ngaydi = \'" + fromDate + "\' ";
	console.log(queryString);

	connection.query(queryString, function(err,results) {
		
		if (!err) {
			// console.log(results);
			var arrayResults = [];
			for(var i = 0 ; i < results.length ; i++) {
				
				var itemKeys = Object.keys(results[i]);
				var object = {};
				var item = results[i];

				itemKeys.forEach(function(key) {
					object[key] = item[key];
				});
				
				if (isQueryPassenger) {

				} else {
				//	object["hanhkhach"] = [];	
				}
				arrayResults.push(object);
			}
			
			console.log(arrayResults);
			res.send({
				"chuyenbay": arrayResults
			});	
		} else {
			console.log(err);
			res.sendStatus(404);
		}
	});

}

// POST chuyenbay/
function insertFlight(req,res,next) {
	var chuyenbay = req.swagger.params.chuyenbay.value.chuyenbay;

	var machuyenbay = chuyenbay.machuyenbay;
	var masanbaydi = chuyenbay.masanbaydi;
	var masanbayden = chuyenbay.masanbayden;
	var ngaygiodi = chuyenbay.ngaydi;
	var hang = chuyenbay.hang;
	var muc = chuyenbay.muc;
	var soghe = chuyenbay.soghe;
	var giaban = chuyenbay.giaban;

	var ngaydi = dateformat(new Date(ngaygiodi * 1000), "yyyy-mm-dd");
	var giodi = dateformat(new Date(ngaygiodi * 1000), "hh:MM");

	if ( hang == undefined || ! (hang.localeCompare('C') || hang.localeCompare('Y') ) ){
		
		res.status(404).send({
				'message': "Hạng phải là C hoặc Y"
		});
		return;
	}

	if (muc != undefined && ! (muc.localeCompare('E') || muc.localeCompare('G') || muc.localeCompare('F') ) ){
		
		res.status(404).send({
				'message': "Mức giá phải là E hoặc F hoặc G"
		});
		return;
	}

	connection.query("INSERT INTO chuyenbay VALUES(?,?,?,?,?,?,?,?,?)", [machuyenbay, masanbaydi, masanbayden, ngaydi, giodi,hang,muc,soghe,giaban], function(err,results) {
		if(err) {
			res.status(404).send({
				'message': "Thêm chuyến bay thất bại vui lòng kiểm tra lại giá trị",
				'error': err
			});
			console.log(err);
		} else {
			var object = {
				'machuyenbay': machuyenbay,
				 'masanbaydi': masanbaydi,
				  'masanbayden': masanbayden,
				   'ngaydi':ngaygiodi,
				    'giodi':ngaygiodi,
				    'hang': hang,
				    'muc': muc,
				    'soghe': soghe,
				    'giaban' : giaban
			};
			res.send({
				"chuyenbay": object,
				"message": results.message
			});
		}
	});
}

// PUT chuyenbay/?machuyenbay?masanbaydi?masanbayden?ngaydi?hang?muc
function updateFlight(req,res,next) {

	var chuyenbay = req.swagger.params.chuyenbay.value.chuyenbay;
	

	var machuyenbay = chuyenbay.machuyenbay;
	var masanbaydi = chuyenbay.masanbaydi;
	var masanbayden = chuyenbay.masanbayden;
	var ngaygiodi = chuyenbay.ngaydi;
	var hang = chuyenbay.hang;
	var muc = chuyenbay.muc;
	var soghe = chuyenbay.soghe;
	var giaban = chuyenbay.giaban;
	var ngaydi = dateformat(new Date(ngaygiodi * 1000), "yyyy-mm-dd");
	var giodi = dateformat(new Date(ngaygiodi * 1000), "hh:MM");
	var updateChuyenbay = {
		'machuyenbay': machuyenbay,
		'masanbaydi': masanbaydi,
		'masanbayden': masanbayden,
	   	'ngaydi':ngaydi,
	    'giodi':giodi,
	    'hang': hang,
	    'muc': muc,
	    'soghe': soghe,
	    'giaban' : giaban
	}

	if ( hang == undefined || ! (hang.localeCompare('C') || hang.localeCompare('Y') ) ){
		
		res.status(404).send({
				'message': "Hạng phải là C hoặc Y"
		});
		return;
	}

	if (muc != undefined && ! (muc.localeCompare('E') || muc.localeCompare('G') || muc.localeCompare('F') ) ){
		
		res.status(404).send({
			'message': "Mức giá phải là E hoặc F hoặc G"
		});
		return;
	}

	
	
	var flightID = req.swagger.params.machuyenbay.value;
	
	var fromID = req.swagger.params.masanbaydi.value;
	var toID = req.swagger.params.masanbayden.value;
	var fromTimeStamp = req.swagger.params.ngaydi.value; 

 	var hangVe = req.swagger.params.hang.value; 
 	var mucgia = req.swagger.params.mucgia.value; 
	var fromTimeString = dateformat(new Date(fromTimeStamp * 1000), "yyyy-mm-dd");



	var whereString = util.format("machuyenbay = \'%s\' AND masanbaydi = \'%s\' AND masanbayden = \'%s\' AND ngaydi  = \'%s\' AND hang = \'%s\' AND muc = \'%s\'", flightID, fromID,toID,fromTimeString,hangVe,mucgia);
	console.log(whereString);
	connection.query("Update chuyenbay SET ? WHERE " + whereString, updateChuyenbay, function(error, results) {
		if(error) {
			res.status(404).send({
				'message': "Thêm chuyến bay thất bại vui lòng kiểm tra lại giá trị",
				'error': error
			});
			console.log(error);
		} else {
			console.log(results);
			updateChuyenbay.ngaydi = ngaygiodi;
			updateChuyenbay.giodi = ngaygiodi;
			res.send({
				"chuyenbay": updateChuyenbay,
				"message": results.message
			});
		}
	})

}

// DELETE chuyenbay/?machuyenbay?masanbaydi?masanbayden?ngaydi?hang?muc
function deleteFlight(req,res,next) {

	var flightID = req.swagger.params.machuyenbay.value;
	var fromID = req.swagger.params.masanbaydi.value;
	var toID = req.swagger.params.masanbayden.value;
	var fromTimeStamp = req.swagger.params.ngaydi.value; 
 	var hangVe = req.swagger.params.hang.value; 
 	var mucgia = req.swagger.params.mucgia.value; 
	var fromTimeString = dateformat(new Date(fromTimeStamp * 1000), "yyyy-mm-dd");

	var whereString = util.format("machuyenbay = \'%s\' AND masanbaydi = \'%s\' AND masanbayden = \'%s\' AND ngaydi = \'%s\' AND hang = \'%s\' AND muc = \'%s\'", flightID, fromID,toID,fromTimeString,hangVe,mucgia);
	console.log(whereString);
	connection.query("DELETE FROM chuyenbay WHERE " + whereString, function(error,results){
		if(error) {
			res.status(404).send({
				"message": "Có lỗi xãy ra vui lòng thử lại",
				'error': error
			});
			console.log(error);
		} else {
			res.send({
				"affectedRows": results.affectedRows
			});
		}
	})
}











































// // BOOK vé với POST trả về mã đặt chỗ
// function bookTicket(res,req,next) {

// 	// Required
// 	var flightID = req.swagger.params.machuyenbay.value;
// 	var fromDateTimeStamp = req.swagger.params.ngaydi.value;
// 	var mucgia = req.swagger.params.muc.value;
// 	var hang = req.swagger.params.hang.value;
// 	var soghe = req.swagger.params.soghe.value; 

// 	var fromDate = dateformat(new Date(fromDateTimeStamp * 1000), "yyyy-mm-dd");

	
// 	var queryGiaVe = util.format("select giaban from chuyenbay where machuyenbay = \'%s\' and ngaydi = \'%s\' and hang = \'%s\' and muc = \'%s\'", "CF108","2016/10/20","C","F");

// 	connection.query(queryGiaVe, function(err, results) {
// 		try {
// 			if (!err) {
// 				if (results != undefined ) { 
// 					if (results.length == 0) {
// 						res.sendStatus(404);
// 					} else {
// 						console.log(results);
// 						var madatcho = generateUUID.generate(6);
// 						var thoigiancapphat = dateformat(new Date(), "yyyy-mm-dd");
// 						var queryDatCho = util.format("INSERT INTO DATCHO(madatcho, thoigiandatcho, tongtien, trangthai) values(\'%s\',\'%s\',%d,%d)", madatcho, thoigiancapphat , results[0].giaban * soghe, 0);
						
// 						var queryChiTietChuyenBay = util.format("INSERT INTO chitietchuyenbay(madatcho, machuyenbay, ngay, hang, mucgia) values(\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')",madatcho,flightID,fromDate,hang,mucgia);

// 						console.log(queryDatCho);
// 						console.log(queryChiTietChuyenBay);

// 						connection.query(queryDatCho, function(err,results) {

// 							if(!err) {
// 								con
// 								connection.query(queryChiTietChuyenBay, function(err,results) {
// 									if(!err) {
// 										res.send({
// 											"datcho" : {
// 												"madatcho": madatcho,
// 												"machuyenbay": machuyenbay,
// 												"ngaydi": fromDate,
// 												"thoigiancapphat": thoigiancapphat,
// 												"thoihansudung": 5*60*1000
// 											}
// 										});
// 									} else {
// 										res.sendStatus(404);
// 										var queryDeleteDatCho = util.format("DELETE FROM datcho where madatcho = \'%s\'",madatcho);
// 										console.log(queryDeleteDatCho); 

// 										connection.query(queryDeleteDatCho, function(err,results) {
// 											if (!err) {
// 												console.log(err);
// 											}
// 										});
// 									}
// 								});
// 							} else {
// 								res.sendStatus(404);
// 							}
// 						});
// 					} }
// 			} else {
// 				res.sendStatus(404);
// 				console.log(err);
// 			}
// 		} catch (e) {
// 			res.sendStatus(404);
// 		}
// 	});
// }

// function updateInfoTicket(res,req,nxet) {

// 	var madatcho = req.swagger.params.madatcho.value;
	
// }




