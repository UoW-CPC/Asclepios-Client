/// APPLICATION CONFIGURATION
var appConfig={
<<<<<<< HEAD
	 'base_url_ta' : 'http://127.0.0.1:8000',
	 'base_url_sse_server' : 'http://127.0.0.1:8081',
	 'KeyG' : '123',
	 'key_encrypt': 'key encrypt',  //Key for encrypting json object
	 'salt' : 'abc123!?', // salt value for encryption
	 'iv' : 'abcdefg', // iv for encryption
	 'iter' : 10000,
	 'ks' : 128,
	 'ts' : 64,
	 'hash_length' : 256,
	 'used_fields' : 4,
	 'all_fields' : 24
}
/// APPLICATION CONFIGURATION - End

/// REQUESTS: Get, Post, Put
function getRequest(api_url) {
	var ret=null;
	//console.log("get url:",api_url);
	$.ajax({
		url: api_url,
		type: 'GET',
		async: false, // disable asynchronous, to wait for the response from the server
		success: function(data) {
			//console.log("get request data", data);
			ret = data;
		},
		error: function(erro){
			console.error("Get Request Error");
		}
	})
	return ret;
}

function postRequest(api_url, jsonObj, callback) {
	//console.log("url:", api_url);
	console.log("data:", jsonObj);
	$.ajax({
		url: api_url,
		type: 'POST',
		contentType: 'application/json',
		data: jsonObj,
		success: function(data) {
			//console.log("post request");
			/*if(data!=undefined){
				console.log(data);
			}*/
			if(callback!=undefined){
				callback(data);
			}
		},
		error: function(erro){
			console.error("Post Request Error");
		}
	})
}


function putRequest(api_url, jsonObj, callback) {
	$.ajax({
		url: api_url,
		type: 'PUT',
		contentType: 'application/json',
		data: jsonObj,
		success: function(data) {
			//console.log("put request data");
			/*if(data!=undefined){
				console.log(data);
			}*/
			if(callback!=undefined){
				callback(data);
			}
		},
		error: function(erro){
			console.error("Put Request Error");
		}
	})
}

/// REQUESTS - End

/// BASIC FUNCTIONS
function hash(input){
	var bitArray = sjcl.hash.sha256.hash(input);
	var ret = sjcl.codec.hex.fromBits(bitArray);
	return ret;
}

function encrypt(key, input){
	var salt = btoa(appConfig.salt);//btoa("abc123!?");
	var iv = btoa(appConfig.iv);//btoa("abcdefg");
	//console.log("salt:",salt)
	var options = {mode:"ccm",iter:10000,ks:128,ts:64,v:1,cipher:"aes",adata:"",salt:salt, iv:iv}; //define salt, mode for encryption

	var res = sjcl.encrypt(key, input, options);
	return res; // return a ciphertext object
}

function decrypt(key, cipherObj){
	var res = ""
	try{
		res = sjcl.decrypt(key, cipherObj);
	}
	catch(err){
		console.log("error in decrypting:",err)
	}
	return res;	
}

function getFileNo(keyword){	
	var fileNo = 0;
	var fileNoUri = "";
	
	var obj = getRequest(appConfig.base_url_ta + "/api/v1/fileno/?w=" + keyword);
	//console.log("result:",obj);

	if (obj.meta.total_count > 0) {
		fileNo =  obj.objects[0].fileno;
		fileNoUri = appConfig.base_url_ta + obj.objects[0].resource_uri;
	}
	//console.log("Inside getFileNo, fileno:", fileNo);
	return [fileNo, fileNoUri];
}

function getSearchNo(keyword){	
	var obj = getRequest(appConfig.base_url_ta + "/api/v1/searchno/?w=" + keyword);

	var searchNo = 0;
	var searchNoUri = "";
	
	if (obj.meta.total_count > 0) {
		searchNo = obj.objects[0].searchno;
		searchNoUri = appConfig.base_url_ta +  obj.objects[0].resource_uri;
	}
	return [searchNo, searchNoUri];
}

function computeKeyMap(keyG,hashVal,searchNo){
	var ret = encrypt(keyG, hashVal+searchNo);
	return ret;
}

function computeHashVal(keyG, keyMap){
	var hashLength = appConfig.hash_length;
	var hashVal;
	var searchNo;
	var res = decrypt(keyG, keyMap);
	
	// Extracth hash value and search number
	hashVal = res.substring(1, hashLength);
	searchNo = res.substring(hashLength+1,res.length);
	
	return [hashVal,searchNo];
}

// Flatten json object
function flattenObject(obj){
	var toReturn = {};
	
	for (var i in obj) {
		if (!obj.hasOwnProperty(i)) continue;
		
		if ((typeof obj[i]) == 'object') {
			var flatObject = flattenObject(ob[i]);
			for (var x in flatObject) {
				if (!flatObject.hasOwnProperty(x)) continue;
				
				toReturn[i + '.' + x] = flatObject[x];
			}
		} else {
			toReturn[i] = obj[i];
		}
	}
	return toReturn;
}

function handleFileLoad(event){
	  console.log(event);
	  var jsonObj = JSON.parse(event.target.result);
	  console.log("json object:",jsonObj);
	  
=======
	 'KeyG' : '123', //Key shared with TA
	 'key_encrypt': 'key encrypt',  //Key for encrypting/ decrypting json object
	 'used_fields' : 2, // number of active fields in json_form.html
	 'all_fields' : 24 // total number of fields in json_form.html
}
/// APPLICATION CONFIGURATION - End

/// HANDLERS
// Handle event of data upload data
function handleFileLoad(event){
>>>>>>> develop
	  var KeyG = appConfig.KeyG;
	  var Kenc = appConfig.key_encrypt; //Key for encrypting json object
      
	  var file_id = hash(Math.random().toString(36).substring(7)); // generate unique file_id. This should be changed in production
	  
<<<<<<< HEAD
	  console.log("1st item in json object:", Object.keys(jsonObj)[0], Object.values(jsonObj)[0]);
	  var first_kv = Object.keys(jsonObj)[0] + Object.values(jsonObj)[0];
	  var json_id = hash(jsonObj[1] + Math.random().toString(36).substring(7));
	  console.log("json id:",json_id);
	  
	  //loop over json object
	  var json_keys = Object.keys(jsonObj);
	  var json_values = Object.values(jsonObj);
	  var length = json_keys.length;
	  var i, w;
	  
	  var KeyG = appConfig.KeyG;
	  var Kenc = appConfig.key_encrypt; //Key for encrypting json object
	  
	  for(i=0; i< length; i++){
		  w = json_keys[i] + json_values[i],
		  //console.log(w);
		  processKeyword(w, KeyG, Kenc, json_id);
	  }
=======
	  console.log("file id:",file_id);
	  var jsonObj = JSON.parse(event.target.result); //parse json file content into json objects
      
      var st_date = new Date();
      var st_time = st_date.getTime();
      
	  uploadData(jsonObj,file_id,KeyG,Kenc); // Upload data to CSP
	  
      var end_date = new Date();
      var end_time = end_date.getTime();
      var diff = end_time - st_time;
      console.log("Submit process completed. Exec time: ", diff);
      $('#exetime').html("<div class='alert-primary alert'> Exec time: " +  diff + " </div>");
>>>>>>> develop
}

// Handle search data event
function handleSearchFileLoad(event){
	var KeyG = appConfig.KeyG;	//shared key with TA
	var Kenc = appConfig.key_encrypt; //symmetric key which is used for decryption

<<<<<<< HEAD
function processKeyword(w, KeyG, Kenc, json_id){
	var fileNo; // file number
	var fileNoUri; // URL to retrieve file number
	var KeyW;  // Key for creating addresses
	
	// Retrieve file number
	[fileNo, fileNoUri] = getFileNo(w);				
	console.log("File number: ", fileNo);
	console.log("Url:", fileNoUri)

	var searchNo; // search number
	var searchNoUri; // URL to retrieve search number
	
	// Retrieve search number
	[searchNo, searchNoUri] = getSearchNo(w);
	console.log("Search number: ", searchNo);
	console.log("Url: ", searchNoUri);

	// Increase file number
	fileNo = fileNo + 1;
	console.log('New file number: ',fileNo);

	if(fileNo==1){ // If the keyword is new, create fileNo in TA
		console.log('Create new entry in fileNo');
		var jsonData = '{ "w" : "' + w + '","fileno" : ' + fileNo + '}';
		postRequest(appConfig.base_url_ta + "/api/v1/fileno/", jsonData, function(data){
			$('#notify').empty();
			$('#notify').html("<div class='alert-primary alert'> Submit completed </div>");
		});					
	}
	else{ // If the keyword is existed, update fileNo in TA
		console.log('Update the entry in fileNo');
		putRequest(fileNoUri,'{ "fileno" : ' + fileNo + '}', function(data){
			$('#notify').empty();
			$('#notify').html("<div class='alert-primary alert'> Submit completed </div>");
		});
	}
	
	// Compute the new key
	var hashVal = hash(w);
	KeyW = encrypt(KeyG,hash(w) + searchNo);	
	console.log("Keyword:",w," - Hash of keyword:",hashVal," -Search number:",searchNo)
	console.log("ciphertext:",KeyW);
	//var plaintext = decrypt(KeyG,KeyW);
	//console.log("plaintext:",plaintext);
	
	// Retrieve ciphertext value from the ciphertext object KeyW
	KeyW_ciphertext = JSON.parse(KeyW).ct;
	console.log("KeyW_ciphertext:",KeyW_ciphertext);
	
	// Compute the address in the dictionary
	var addr = hash(KeyW_ciphertext + fileNo + "0"); 
	//console.log("type of address:", typeof addr)
	console.log("Address:" + addr);
	
	//Encrypt keyword
	var c = encrypt(Kenc, w);
	var cipher = '{ "jsonId" : "' + json_id + '","data" : ' + c + '}';
	
	// Send ciphertext to CSP
	postRequest(appConfig.base_url_sse_server + "/api/v1/ciphertext/", cipher);
	console.log("Send encrypted data to CSP: "," - json id: ", json_id," - encrypted data: ", c);
	
	// Compute value of entry in the dictionary
	var val = encrypt(Kenc, json_id + fileNo);
	console.log("json_id:", json_id, " - file number:", fileNo, " - value of entry in the dictionary:",val);
	var address = '{ "address" : "' + addr + '","location" : ' + val + '}';
	
	// Send new address, and value to CSP
	postRequest(appConfig.base_url_sse_server + "/api/v1/map/", address);	
	console.log("Send map to CSP: "," - address: ", json_id," - value: ", c);
}


function findKeyword(keyword, KeyG, Kenc){
	console.log("Search keyword function");
	
	var fileNo, fileNoUri;
	
	// Get file number
	[fileNo, fileNoUri] = getFileNo(keyword);
	
	// Get search number
	var searchNo, searchNoUri;
	[searchNo, searchNoUri] = getSearchNo(keyword);
	console.log(" - searchNo: ",searchNo, " - searh number url: ", searchNoUri);
	
	// Compute KeyW
	var KeyW = encrypt(KeyG,hash(keyword)+searchNo); 
	//console.log("type of ciphertext:", typeof KeyW)
	console.log("Search number: ",searchNo," - KeyW: ",KeyW);
	
	// Increase search number:
	searchNo = searchNo + 1;
	
	// Compute new KeyW with the increased search number
	var newKeyW = encrypt(KeyG,hash(keyword)+searchNo);
	console.log("Increased search number: ", searchNo, " - new KeyW: ", newKeyW);
	
	var newKeyW_ciphertext = JSON.parse(newKeyW).ct;
	console.log("newKeyW_ciphertext:",newKeyW_ciphertext);
	
	var arrayAddr = []
	for(var i=1; i<=fileNo; i++){
		newAddr = "\"" + hash(newKeyW_ciphertext + i + "0") + "\""
		console.log("hash input:", newKeyW_ciphertext + i + "0");
		console.log("hash output (address):", newAddr);
		arrayAddr.push(newAddr);
	} //end for
	
	var jsonData = {
		"KeyW": KeyW,
		"fileno": fileNo,
		"Lu":arrayAddr
	};
	var data = '{ "KeyW" : ' + KeyW + ',"fileno" : ' + fileNo + ',"Lu" :[' + arrayAddr + ']}';
	//var data = JSON.stringify(jsonData);
	console.log("Data sent to CSP:", data);
	
	hashChars = appConfig.hash_length/4; //number of chars of hash output: 64
	
	$('#result').empty();
	
	postRequest(appConfig.base_url_sse_server + "/api/v1/search/", data, function(response){
		console.log("response of search:",response.Cfw)
		// decrypt the location to json_id, which is used to request data
		console.log("length of response:",response.Cfw.length)
		
		var found_ret=0; // the number of found results
		
		for(var j=0; j<response.Cfw.length; j++){
			var ct = response.Cfw[j]
			var ct_reformat = ct.replace(new RegExp('\'', 'g'), '\"'); //replace ' with "
			console.log("ct_reformat:",ct_reformat)
			console.log("j:",j)
			console.log("item j in response:",ct)
			console.log("decrypting")
			console.log("type of response:", typeof ct)
			var json_id_fileno = decrypt(Kenc,ct_reformat)
			console.log("found json_id_fileno:",json_id_fileno)
			json_id_found = json_id_fileno.substring(0,hashChars)
			console.log("found json:",json_id_found)
			
			found_ret = found_ret + 1; // count the number of found results

			// get data by json_id
			var getresponse = getRequest(appConfig.base_url_sse_server + "/api/v1/ciphertext/?jsonId=" + json_id_found);
			var objs_data = getresponse["objects"];
			//console.log("get response:",objs_data)
			var length = objs_data.length;
			for (var i = 0; i < length; i++) {
				console.log("object:",objs_data[i].data);
				var obj_data_reformat =objs_data[i].data.replace(new RegExp('\'', 'g'), '\"'); //replace ' with "
				
				var text = decrypt(Kenc,obj_data_reformat)
				console.log("decrypted data:",text)
				//$('#result').append("<div class='alert-primary alert'>" + text + "</div>");
			}
			
		}
		
		// Update search number to TA
		if(searchNo==1){ // If the keyword is new, create searchNo in TA
			var jsonData = '{ "w" : "' + keyword + '","searchno" : ' + searchNo + '}';
			console.log('Create new entry in searchNo: ',jsonData);
			postRequest(appConfig.base_url_ta + "/api/v1/searchno/", jsonData);					
		}
		else{ // If the keyword is existed, update searchNo in TA
			console.log('Update the entry in searchno');
			putRequest(searchNoUri,'{ "searchno" : ' + searchNo + '}');
		}	
		
		$('#result').append("<div class='alert-primary alert'> Found " + found_ret + " results </div>");
	}); // Send request to CSP
=======
	var jsonObj = JSON.parse(event.target.result);
	
	var st_date = new Date();
    var st_time = st_date.getTime();
   
	var results=search(jsonObj,KeyG,Kenc);
	
    var end_date = new Date();
    var end_time = end_date.getTime();
    var diff = end_time - st_time;
    
	console.log("Found results:",results);
	
	$('#result').empty();
	$('#searchtime').empty();
	$('#result').append("<div class='alert-primary alert'> Found " + results["count"] + " results </div>");
	$('#searchtime').html("<div class='alert-primary alert'> Search time: " +  diff + " </div>");
}

// Include sse.js
function dynamicallyLoadScript(url) {
    var script = document.createElement("script"); //Make a script DOM node
    script.src = url; //Set it's src to the provided URL
    document.head.appendChild(script); //Add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
>>>>>>> develop
}

//Handle update data event
function handleUpdateFileLoad(event){
	var KeyG = appConfig.KeyG;	//shared key with TA
	var Kenc = appConfig.key_encrypt; //symmetric key which is used for decryption

	var jsonObj = JSON.parse(event.target.result);
	
	var st_date = new Date();
    var st_time = st_date.getTime();
    var file_id = "7f10e2a17b749047dfedfc07a8ce948415393026dbe54306067f246411188fe4";
	var result=update(jsonObj,file_id,KeyG,Kenc);
	console.log("Update result:",result)
	if(result==true){
		message = "Updated"
	}
	else
		message = "At least one update field/ value does not exist. Halt update."
	
    var end_date = new Date();
    var end_time = end_date.getTime();
    var diff = end_time - st_time;
	
	$('#update').empty();
	$('#updatetime').empty();
	$('#update').append("<div class='alert-primary alert'>" + message+ "</div>");
	$('#updatetime').html("<div class='alert-primary alert'> Update time: " +  diff + " </div>");
	
}
/// HANDLERS - END

$(document).ready(
		function() {
			$("input[name='inputFormat']").change(function () {
	            if ($(this).val() == 'json_input') {
					$("#json-form").prop("hidden", true);
					$("#search-form").prop("hidden", true);
					
					$("#json-file").prop("hidden",false);
					$("#search-file").prop("hidden", false);
					
	            }
	            else {
					$("#json-file").prop("hidden",true);
					$("#search-file").prop("hidden", true);
					
					$("#json-form").prop("hidden", false);
					$("#search-form").prop("hidden", false);
	            }
	        });
			
			$("#jsonInput").click(function(){
				$('#notify').empty();
				$('#exetime').empty();
				$('#result').empty();
				$('#searchtime').empty();
			});
			
			$("#formInput").click(function(){
				$('#notify').empty();
				$('#exetime').empty();
				$('#result').empty();
				$('#searchtime').empty();
			});
			
			dynamicallyLoadScript('static/js/sse.js')
			// ADD PATIENT by submitting file
			$("#btnSubmitFile").click(function(){
				$('#notify').empty();
				if ($('#jsonFile').get(0).files.length === 0) {
				    console.log("No files selected.");
				}
				else{
					var reader = new FileReader()
					reader.onload = handleFileLoad;
					reader.readAsText($('#jsonFile').get(0).files[0]);
				}
<<<<<<< HEAD
=======
				$('#notify').html("<div class='alert-primary alert'> Submitted </div>");
>>>>>>> develop
			});
			
			console.log("Symmetric Searchable Encryption Scheme");
			
			
			// Submit with form
			noFields = appConfig.used_fields + 1; //1 is for the field 'csrf_token'
			allFields = appConfig.all_fields; 
			console.log("Number of visible fields: ", noFields );
			
			// Disable unused fields
			for(var i=noFields; i<= allFields; i++){
				var id = "#field" + i;
				$(id).prop( "disabled", true );
				
				id = "#select" + i;
				$(id).prop( "disabled", true );
			}
			
			/// ADD PATIENT by form
			$('#btnSubmit').click(function(){
<<<<<<< HEAD
				var y = $("#json-form").serializeArray();
=======
				$('#notify').empty();
				$('#notify').html("<div class='alert-primary alert'> Submitting </div>");
				
				var data = $("#json-form").find("input[name!=csrfmiddlewaretoken]").serializeArray();//get all data, except the hidden value: "name":"csrfmiddlewaretoken"
>>>>>>> develop
				
				var KeyG = appConfig.KeyG;
				var Kenc = appConfig.key_encrypt; //Key for encrypting json object

				console.log("Number of input fields: ", data.length);
				console.log("Serialized data:",data[0]);
				
				var no_data = data.length;
				var jsonObj = '{';
				for(var i=0; i< no_data; i++){
					jsonObj = jsonObj + '"' + data[i]["name"] + '":"' + data[i]["value"] + '",' 
				}
				jsonObj = jsonObj.slice(0, -1); // remove the last comma
				jsonObj = jsonObj + '}';
				jsonObj = JSON.parse(jsonObj);
				console.log("Json data:",jsonObj);
			    
				var file_id = hash(Math.random().toString(36).substring(7));
				
				var st_date = new Date();
			    var st_time = st_date.getTime();
				uploadData(jsonObj,file_id,KeyG,Kenc); // Upload data to CSP
				  
			    var end_date = new Date();
			    var end_time = end_date.getTime();
			    var diff = end_time - st_time;
	
			    console.log("Submit process completed. Exec time: ", diff);
				$('#notify').empty();
				$('#notify').html("<div class='alert-primary alert'> Submitted </div>");
			    $('#exetime').html("<div class='alert-primary alert'> Exec time: " +  diff + " </div>");

<<<<<<< HEAD
					var w = (field.name).concat(field.value);
					console.log("Keyword:",w);
					
					processKeyword(w, KeyG, Kenc, json_id);

					/*var fileNo; // file number
					var fileNoUri; // URL to retrieve file number
					
					// Retrieve file number
					[fileNo, fileNoUri] = getFileNo(w);				
					console.log("File number: ", fileNo);
					console.log("Url:", fileNoUri)

					var searchNo; // search number
					var searchNoUri; // URL to retrieve search number
					
					// Retrieve search number
					[searchNo, searchNoUri] = getSearchNo(w);
					console.log("Search number: ", searchNo);
					console.log("Url: ", searchNoUri);

					// Increase file number
					fileNo = fileNo + 1;
					console.log('New file number: ',fileNo);

					if(fileNo==1){ // If the keyword is new, create fileNo in TA
						console.log('Create new entry in fileNo');
						var jsonData = '{ "w" : "' + w + '","fileno" : ' + fileNo + '}';
						postRequest(appConfig.base_url_ta + "/api/v1/fileno/", jsonData, function(data){
							$('#notify').empty();
							$('#notify').html("<div class='alert-primary alert'> Submit completed </div>");
						});					
					}
					else{ // If the keyword is existed, update fileNo in TA
						console.log('Update the entry in fileNo');
						putRequest(fileNoUri,'{ "fileno" : ' + fileNo + '}', function(data){
							$('#notify').empty();
							$('#notify').html("<div class='alert-primary alert'> Submit completed </div>");
						});
					}
					
					// Compute the new key
					var hashVal = hash(w);
					KeyW = encrypt(KeyG,hash(w) + searchNo);	
					console.log("Keyword:",w," - Hash of keyword:",hashVal," -Search number:",searchNo)
					console.log("ciphertext:",KeyW);
					//var plaintext = decrypt(KeyG,KeyW);
					//console.log("plaintext:",plaintext);
					
					// Retrieve ciphertext value from the ciphertext object KeyW
					KeyW_ciphertext = JSON.parse(KeyW).ct;
					console.log("KeyW_ciphertext:",KeyW_ciphertext);
					
					// Compute the address in the dictionary
					var addr = hash(KeyW_ciphertext + fileNo + "0"); 
					//console.log("type of address:", typeof addr)
					console.log("Address:" + addr);
					
					//Encrypt keyword
					var c = encrypt(Kenc, w);
					var cipher = '{ "jsonId" : "' + json_id + '","data" : ' + c + '}';
					
					// Send ciphertext to CSP
					postRequest(appConfig.base_url_sse_server + "/api/v1/ciphertext/", cipher);
					console.log("Send encrypted data to CSP: "," - json id: ", json_id," - encrypted data: ", c);
					
					// Compute value of entry in the dictionary
					var val = encrypt(Kenc, json_id + fileNo);
					console.log("json_id:", json_id, " - file number:", fileNo, " - value of entry in the dictionary:",val);
					var address = '{ "address" : "' + addr + '","location" : ' + val + '}';
					
					// Send new address, and value to CSP
					postRequest(appConfig.base_url_sse_server + "/api/v1/map/", address);	
					console.log("Send map to CSP: "," - address: ", json_id," - value: ", c);*/
				}//end for
				
				// Clear values in the input form
				//$("#json-form").reset();
				//$("#patientName").val('');
				//$("#patientEmail").val('');
=======
>>>>>>> develop
			});//end btnSubmit
			
			/// SEARCH FOR PATIENT by form
			$('#btnSearch').click(function(){
				// Get value of keyword from the search box and the radio box
				//var radioVal = $("input[name='searchBy']:checked").val();
				var selectVal = $("#searchBy  option:selected").val();
				var keyword = selectVal + "|" +  $("#keyword").val();
				
				var KeyG = appConfig.KeyG;	
				var Kenc = appConfig.key_encrypt;
				
				//console.log("selected radio:", selectVal);
				//console.log("start search");
				console.log("keyword for search", keyword);
<<<<<<< HEAD
				findKeyword(keyword,KeyG,Kenc);		
				//console.log("start search");
				//findKeyword(keyword,KeyG,Kenc);
				
				/*
				var fileNo, fileNoUri;
				
				// Get file number
				[fileNo, fileNoUri] = getFileNo(keyword);
				
				// Get search number
				var searchNo, searchNoUri;
				[searchNo, searchNoUri] = getSearchNo(keyword);
				console.log(" - searchNo: ",searchNo, " - searh number url: ", searchNoUri);

				
				// Compute KeyW
				var KeyW = encrypt(KeyG,hash(keyword)+searchNo); 
				//console.log("type of ciphertext:", typeof KeyW)
				console.log("Search number: ",searchNo," - KeyW: ",KeyW);
				
				// Increase search number:
				searchNo = searchNo + 1;
				
				// Compute new KeyW with the increased search number
				var newKeyW = encrypt(KeyG,hash(keyword)+searchNo);
				console.log("Increased search number: ", searchNo, " - new KeyW: ", newKeyW);
				
				var newKeyW_ciphertext = JSON.parse(newKeyW).ct;
				console.log("newKeyW_ciphertext:",newKeyW_ciphertext);
				
				var arrayAddr = []
				for(var i=1; i<=fileNo; i++){
					newAddr = "\"" + hash(newKeyW_ciphertext + i + "0") + "\""
					console.log("hash input:", newKeyW_ciphertext + i + "0");
					console.log("hash output (address):", newAddr);
					arrayAddr.push(newAddr);
				} //end for
				
				var jsonData = {
					"KeyW": KeyW,
					"fileno": fileNo,
					"Lu":arrayAddr
				};
				var data = '{ "KeyW" : ' + KeyW + ',"fileno" : ' + fileNo + ',"Lu" :[' + arrayAddr + ']}';
				//var data = JSON.stringify(jsonData);
				console.log("Data sent to CSP:", data);
				
				hashChars = appConfig.hash_length/4; //number of chars of hash output: 64
				
				$('#result').empty();
				
				postRequest(appConfig.base_url_sse_server + "/api/v1/search/", data, function(response){
					console.log("response of search:",response.Cfw)
					// decrypt the location to json_id, which is used to request data
					console.log("length of response:",response.Cfw.length)
					for(var j=0; j<response.Cfw.length; j++){
						var ct = response.Cfw[j]
						var ct_reformat = ct.replace(new RegExp('\'', 'g'), '\"'); //replace ' with "
						console.log("ct_reformat:",ct_reformat)
						console.log("j:",j)
						console.log("item j in response:",ct)
						console.log("decrypting")
						console.log("type of response:", typeof ct)
						var json_id_fileno = decrypt(Kenc,ct_reformat)
						console.log("found json_id_fileno:",json_id_fileno)
						json_id_found = json_id_fileno.substring(0,hashChars)
						console.log("found json:",json_id_found)
						// get data by json_id
						var getresponse = getRequest(appConfig.base_url_sse_server + "/api/v1/ciphertext/?jsonId=" + json_id_found);
						var objs_data = getresponse["objects"];
						//console.log("get response:",objs_data)
						var length = objs_data.length;
						for (var i = 0; i < length; i++) {
							console.log("object:",objs_data[i].data);
							var obj_data_reformat =objs_data[i].data.replace(new RegExp('\'', 'g'), '\"'); //replace ' with "
							
							var text = decrypt(Kenc,obj_data_reformat)
							console.log("decrypted data:",text)
							$('#result').append("<div class='alert-primary alert'>" + text + "</div>");
						}
						
					}
					
					// Update search number to TA
					if(searchNo==1){ // If the keyword is new, create searchNo in TA
						var jsonData = '{ "w" : "' + keyword + '","searchno" : ' + searchNo + '}';
						console.log('Create new entry in searchNo: ',jsonData);
						postRequest(appConfig.base_url_ta + "/api/v1/searchno/", jsonData);					
					}
					else{ // If the keyword is existed, update searchNo in TA
						console.log('Update the entry in searchno');
						putRequest(searchNoUri,'{ "searchno" : ' + searchNo + '}');
					}
				}); // Send request to CSP*/
=======
				
				var st_date = new Date();
			    var st_time = st_date.getTime();
				data = findKeyword(keyword,KeyG,Kenc);	
				
			    var end_date = new Date();
			    var end_time = end_date.getTime();
			    var diff = end_time - st_time;
	
			    console.log("Search process completed. Exec time: ", diff);
			    console.log("Retrieved data:",data);
				$('#result').empty();
				$('#result').append("<div class='alert-primary alert'> Found " + data["count"] + " results </div>");

			    $('#searchtime').html("<div class='alert-primary alert'> Search time: " +  diff + " </div>");
>>>>>>> develop
			});//end btnSearch
			
			/// SEARCH FOR PATIENT by submitting json file
			$('#btnSearchFile').click(function(){
				if ($('#jsonSearchFile').get(0).files.length === 0) {
					console.log("No files selected.");
				}
				else{
					var reader = new FileReader()
					reader.onload = handleSearchFileLoad;
					reader.readAsText($('#jsonSearchFile').get(0).files[0]);
				}
			});//end btnSearchFile
			
			/// UPDATE by submitting json file
			$('#btnUpdateFile').click(function(){
				$('#resultUpdate').empty();
				$('#resultUpdate').html("<div class='alert-primary alert'> Updating </div>");
				
				if ($('#jsonUpdateFile').get(0).files.length === 0) {
					console.log("No files selected.");
				}
				else{
					var reader = new FileReader()
					reader.onload = handleUpdateFileLoad;
					reader.readAsText($('#jsonUpdateFile').get(0).files[0]);
				}
			});
		});