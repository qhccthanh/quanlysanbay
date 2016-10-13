'user strict'

var fs = require("fs");
var mysql = require("mysql");

var generateUUID = require(__dirname + "/helper/" + "generateUUID");

var airportFile = __dirname + "/resources/" + "airports.json";
var aiport_tofromFile =  __dirname + "/resources/" + "aiport_tofrom.json";

module.exports = {
	getAirportAll,
	getToFromAiportAll,
	getAirportWithID,
};

var connection = mysql.createConnection({
  host     : '166.62.10.228',
  user     : 'qhct',
  password : 'qhct@123',
  database : 'quanlychuyenbay'
});


connection.connect();

connection.query('SELECT * from sanbay where idsanbay = "SGN" ', function(err, rows, fields) {
  if (!err)
    console.log('The solution is: ', rows);
  else
    console.log('Error while performing Query. ' + err);
});

connection.end();


function getAirportAll(req,res,next) {

	fs.readFile( airportFile, 'utf8', function (err, data) {
		//console.log(data);
		var value = JSON.parse(data);
		console.log(value);
		res.json({
			"sanbay": value
		});
	})
}

function getAirportWithID(req,res,next) {

	var id = req.swagger.params.id.value;

	var uuid = generateUUID.generate(6)

	console.log(uuid);

	fs.readFile( airportFile, 'utf8', function (err, data) {
		var value = JSON.parse(data);

		var arrayFilter = [];
		var keys = Object.keys(value);
		
		for (var i = 0; i < keys.length; i++) {

			var key = keys[i];
			var array = value[key];

			arrayFilter = array.filter(function(element) {
				return element.id == id;
			})

			if (arrayFilter.length != 0) {
				break;
			}
		}

		// No content
		if (arrayFilter.length == 0) {
			res.status(404).json({
				"message": "Không có dữ liệu"
			});
		}  // Have content
		else {
			res.json(arrayFilter);	
		}
	})
}

function findAiportWithID(id) {
	var data = fs.readFileSync(airportFile, 'utf8');
	var value = JSON.parse(data);

	var arrayFilter = [];
	var keys = Object.keys(value);
	
	for (var i = 0; i < keys.length; i++) {

		var key = keys[i];
		var array = value[key];

		arrayFilter = array.filter(function(element) {
			return element.id == id;
		})

		if (arrayFilter.length != 0) {
			break;
		}
	}

	return arrayFilter
}

function findRegionWithID(id) {

	var data = fs.readFileSync(airportFile, 'utf8');
	var value = JSON.parse(data);

	var region = ""; 
	var keys = Object.keys(value);
	
	for (var i = 0; i < keys.length; i++) {

		var key = keys[i];
		var array = value[key];

		var arrayFilter = array.filter(function(element) {
			return element.id == id;
		})

		if (arrayFilter.length != 0) {
			region = key;
			break;
		}
	}

	return region
}

/// Query with 
function getToFromAiportAll(req,res,next) {

	fs.readFile( aiport_tofromFile, 'utf8', function (err, data) {

		var value = JSON.parse(data);
		var fromID = req.swagger.params.masanbaydi.value;
		var fields = req.swagger.params.truong.value;
		
		var numberField = 0;
		
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
		
		// Check is QueryString parameter if is query with fromID
		if (fromID !== null && fromID != undefined) {

			var keys = Object.keys(value);
			var result = {};
			for (var i = 0 ; i < keys.length; i++) {
				var key = keys[i];

				var arrayFilter = value[key].filter(function(element) {
					return element.from == fromID;
				})

				if (arrayFilter.length != 0) {
					var arrayRs = [];
					console.log(arrayFilter.length);

					arrayFilter.forEach(function(item){
						arrayRs.push(getAirportInfoWithFields(item.to,fields, numberField));
					});

					result[key] = arrayRs 
				}
			}

			// No content
			if (Object.keys(result).length == 0) {
				res.status(404).json({
					"message": "Không có dữ liệu"
				});
			}  // Have content
			else {
				res.json({
					"sanbay": result
				});	
			}
			
		} 
		else {

			var keys = Object.keys(value);
			var result = {};
			for (var i = 0 ;i < keys.length; i++) {
				var key = keys[i];
				var fromIDs = value[key].map(function(item) {
					return getAirportInfoWithFields(item.from,fields, numberField);
				});

				result[key] = fromIDs;
			}

			res.json({
				"sanbay": result
			});
		}

	})
}

function getAirportInfoWithFields(id, fields, numberField) {

	if (fields == undefined || fields.localeCompare("id") == 0) {
		return {"id": id};	
	} else {

		var infoItem = findAiportWithID(id);
		// console.log(infoItem);
		if (infoItem.length == 1) {
			var element = infoItem[0];	
			var result = {"id" : element.id};

			if (numberField  & 1 << 0) {
				result["name"] = element.name;
			} 

			if (numberField  & 1 << 1 ) {
				result["city"] = element.name;
			}

			return result;
		}
	}
}


