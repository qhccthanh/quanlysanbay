'user strict'

var fs = require("fs");
var mysql = require("mysql");
var dateformat = require("dateformat");

var generateUUID = require(__dirname + "/helper/" + "generateUUID");
var helper = require(__dirname + "/helper/" + "helper");

var airportFile = __dirname + "/resources/" + "airports.json";
var aiport_tofromFile =  __dirname + "/resources/" + "aiport_tofrom.json";

module.exports = {
	getAirportAll,
	getToFromAiportAll,
};

var connection = mysql.createConnection({
  host     : '166.62.10.228',
  user     : 'qhct',
  password : 'qhct@123',
  database : 'quanlychuyenbay'
});

// var airportsAll = {};

connection.connect();

setInterval(function () {
    connection.query('SELECT 1');
}, 5000);

// connection.query('SELECT * from sanbay where idsanbay = "SGN" ', function(err, results, fields) {
//  //  if (!err) {
//  //  	console.log('The solution is: ', results[0]);
// 	// // console.log('The fields is: ', fields);
//  //  }
//  //  else
//  //    console.log('Error while performing Query. ' + err);
// });

// loadData();

// var converter = require("swagger-to-html")({ /* options */ });

// var targetDir = "/Users/thanhqhc/Documents/Git/Web/LTHD/";
// // call the lesscss-compiler to generate css
// converter.generateCss(targetDir)

// // call handlebars to generate the HTML-code
// fs.readFile("/Users/thanhqhc/Documents/Git/Web/LTHD/quanlychuyenbay/DAGK_BanVeMayBay/api/specs.json", function(err, data){
// 	console.log(err);
// 	converter.generateHtml(data, targetDir);	
// });


function loadData() {
	fs.readFile(__dirname + "/resources/" + "danhsachchuyenbay.txt", 'utf8', function (err,data) {

		console.log("Read Success");
		var array = data.split("\r\n");

		var count = 0;
		for (var i = 0 ; i < array.length; i++) {

			if (array[i].length > 5) {
				connection.query(array[i], function(err,result) {
					count++;
					console.log(count + "/" + array.length);
				});
			}
		}
		

		// connection.query('DELETE FROM chuyenbay',function(err,result){

		// 	for (var i = 1 ; i <= 20; i++) {
		// 		var count = 0;

		// 		for (var j = (max * i)/20 ; j < (max * (i+1))/20 ; j++) {
		// 			connection.query('INSERT INTO chuyenbay SET ?', array[j], function(err, result) {
		//   				console.log(j);
		//   				if (count == array.length) {
		//   					console.log("Complete")
		//   				}
		// 			});
		// 		}
		// 	}
			
		// });

	});
}

// Lấy tất cả sân bay
function getAirportAll(req,res,next) {

	var query = "SELECT * FROM sanbay ";
	console.log(query);

	connection.query(query, function(error,results,fields) {

		var arrayFilter = [];
		if(!error ) {

			if (results.length != 0 ) {
				for(var i = 0; i< results.length; i++) {
					arrayFilter.push({
						"id" : results[0].idsanbay,
						"name": results[0].name,
						"city": results[0].city,
						"region": results[0].region,
					});
				}
			}

			if (arrayFilter.length == 0) {
				res.status(404).json({
					"message": "Không có dữ liệu"
				});
			}  // Have content
			else {
				res.json(arrayFilter);	
			}

		} else {
			console.log("Query: " + query + " Error: " + error);
			res.status(404).json({
				"message": "Lỗi truy vấn dữ liệu"
			});
		}
	});
}

// Tim sân bay đến với mã sân bay đi
// Load tất cả sân bay đi
function getToFromAiportAll(req,res,next) {

	var fromID = req.swagger.params.masanbaydi.value;
	var fields = req.swagger.params.truong.value;
	
	var numberField = 0;
	
	// Kiễm tra trường và get numberField
	if (fields != undefined) {
		var arrayFields = fields.split(",");

		if (arrayFields.length == 0 || arrayFields.length > 3) {
			res.status(403).json({
				"message": "Trường dữ liệu rỗng hoặc quá dài"
			});
			return;
		} else {
			for (var i = 0; i < arrayFields.length; i++) {
				var field = arrayFields[i];

				if ( field.localeCompare("id") &&
					field.localeCompare("name") &&
					 field.localeCompare("city") && 
					field.localeCompare("region")
					) {
					res.status(403).json({
						"message": "Trường dữ liệu không chính xác"
					});
					return;
				}

				if (field.localeCompare("name") == 0) {
					numberField = numberField | 1 << 0
				}

				if (field.localeCompare("city") == 0) {
					numberField = numberField | 1 << 1
				}
			}
		}
	}

	var queryString = ", ";

	// Query trả dữ liệu
	queryString = "SELECT DISTINCT(sb.idsanbay) " + helper.getField("sb", fields, numberField) + "  FROM sanbay sb join chuyenbay cb on (sb.idsanbay = cb.masanbaydi) "

	// Check is QueryString parameter if is query with fromID
	// Trường hợp có fromID truy vấn sân bay đến với sân bay đi
	if (fromID !== null && fromID != undefined) {
		queryString = "SELECT DISTINCT(cb.masanbayden) " + helper.getField("sb", fields, numberField) + "  FROM sanbay sb join chuyenbay cb on (sb.idsanbay = cb.masanbayden) WHERE masanbaydi = \'" +  fromID + "\'";
	} 

	// Fetch all 
	console.log(queryString);

	connection.query(queryString,function(err,result) {
		
		if (err ) {
			console.log(err);
			res.send(403).message("Error query data please try again");
		} else {
			var values = [];
			result.forEach(function(item) {

				var itemKeys = Object.keys(item);
				var object = {};

				itemKeys.forEach(function(key) {
					object[key] = item[key];
				});

				values.push(object);
			});

			res.send({
				"sanbay": values
			});
		}
	});
}



