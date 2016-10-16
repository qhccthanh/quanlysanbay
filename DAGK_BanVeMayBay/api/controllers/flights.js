
'user strict'

var fs = require("fs");
var mysql = require("mysql");
var dateformat = require("dateformat");

var generateUUID = require(__dirname + "/helper/" + "generateUUID");
var helper = require(__dirname + "/helper/" + "helper");

module.exports = {
	getFlight,
	bookTicket,
	getFlightInfo,
};

var connection = mysql.createConnection({
  host     : '166.62.10.228',
  user     : 'qhct',
  password : 'qhct@123',
  database : 'quanlychuyenbay'
});

connection.connect();

// Tìm kiếm chuyến bay
function getFlight(req,res,next) {
	console.log("Call");

	// Required
	var fromID = req.swagger.params.masanbaydi.value;
	var toID = req.swagger.params.masanbayden.value;
	var fromTimeStamp = req.swagger.params.ngaydi.value; 

	// Optional
	var toTimeStamp = req.swagger.params.ngayve.value;
	var hangVe = req.swagger.params.hang.value; 
	var mucgia = req.swagger.params.mucgia.value; 
	var soluongghe = req.swagger.params.soluongghe.value; 

	console.log(fromID);
	console.log(toID);

	var fromDate = dateformat(new Date(fromTimeStamp * 1000), "yyyy-mm-dd");

	var queryString = "SELECT * from chuyenbay where (masanbaydi = \'" + fromID + "\' AND masanbayden = \'" + toID + "\' AND ngaydi = \'" + fromDate + "\'";

	var tempQuery = " ";
	if (hangVe != undefined) {
		tempQuery += " AND hang = \'" + hangVe + "\'";
	}

	if (mucgia != undefined) {
		tempQuery += " AND muc = \'" + mucgia + "\'";
	}

	if (soluongghe != undefined) {
		tempQuery += " AND soghe >= " + soluongghe ;
	}

	queryString += tempQuery + " )";

	if (toTimeStamp != undefined) {

		var toDate = dateformat(new Date(toTimeStamp * 1000), "yyyy-mm-dd");

		queryString += " OR ( masanbaydi = \'" + toID + "\' AND masanbayden = \'" + fromID + "\' AND ngaydi = \'" + toDate + "\'";
		queryString += tempQuery + ")";
	}

	console.log(queryString);

	connection.query(queryString, function(err,results) {
		
		if (!err) {
			console.log(results);
			res.send({"chuyenbay": results});	
		} else {
			res.sendStatus(404);
		}
	});
}

// Lấy thông tin chuyên bay với mã chuyến bay và ngày đi
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

// BOOK vé với POST trả về mã đặt chỗ
function bookTicket(res,req,next) {

}


