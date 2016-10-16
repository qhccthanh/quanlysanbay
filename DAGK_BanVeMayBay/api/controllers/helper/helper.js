'user strict'

module.exports = {getField};

// Lấy trường dữ liệu
function getField(prefix, fields,numberField) {

	// Check if fields is undefined or fields = "id" return empty
	if (fields == undefined || fields.localeCompare("id") == 0) {
		return "";
	} 

	var result = "";

	if (numberField  & 1 << 0) {
		result += "," +  prefix + "." + "name";
	} 

	if (numberField  & 1 << 1 ) {
		result += "," + prefix + "." + "city";
	}

	if (numberField  & 1 << 2 ) {
		result += "," + prefix + "." + "region";
	}

	return result;
}

// 
function getAirportWithID(req,res,next) {

	var id = req.swagger.params.id.value;

	var uuid = generateUUID.generate(6)
	console.log(uuid);

	findAiportWithID(id,function(results){
		// No content
		if (arrayFilter.length == 0) {
			res.status(404).json({
				"message": "Không có dữ liệu"
			});
		}  // Have content
		else {
			res.json(arrayFilter);	
		}
	});
}

// Lấy thông tin sân bay với id
function findAiportWithID(id, callback) {
	
	var arrayFilter = [];
	var query = "SELECT * FROM sanbay where idsanbay = " + "\'" + id + "\'" ;
	console.log(query);
	connection.query(query, function(error,results,fields){
		
		if(!error ) {
			if (results.length != 0 ) {

				arrayFilter.push({
					"id" : results[0].idsanbay,
					"name": results[0].name,
					"city": results[0].city,
					"region": results[0].region,
				});
			}
		} else {
			console.log("Query: " + query + " Error: " + error);
		}
		
		callback(arrayFilter);
	});
	
}