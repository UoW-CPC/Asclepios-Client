/// APPLICATION CONFIGURATION
var appConfig={
	 'base_url_ta' : 'http://127.0.0.1:8000',
	 'base_url_sse_server' : 'http://127.0.0.1:8080',
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

function postRequest(api_url, jsonObj, callback, async_feat=true) {
	//console.log("url:", api_url);
	console.log("data:", jsonObj);
	ret = $.ajax({
		url: api_url,
		type: 'POST',
		contentType: 'application/json',
		data: jsonObj,
		async: async_feat,
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
	}).responseJSON;
	console.log("Results from postRequest with async as",async_feat,":",ret);
	return ret;
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

function patchRequest(api_url, jsonObj, callback) {
	$.ajax({
		url: api_url,
		type: 'PATCH',
		contentType: 'application/json',
		data: jsonObj,
		success: function(data) {
			if(callback!=undefined){
				callback(data);
			}
		},
		error: function(erro){
			console.error("Patch Request Error");
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

function getMultiFileNo(Lw){
	LfileNo = [];
	LfileNoUri = [];
	listW = [];
	
	//var obj = getRequest(appConfig.base_url_ta + "/api/v1/fileno/?w=" + Lw);
	var obj = getRequest(appConfig.base_url_ta + "/api/v1/fileno/?limit=0&w=" + Lw);//limit=0 allows to get all items
	var count = obj.meta.total_count;
	
	console.log("number of items:",count);
	console.log("request for fileno:",appConfig.base_url_ta + "/api/v1/fileno/?w=" + Lw);
	
	for(i=0; i<count;i++){
		console.log("Push item of index:",i);
		LfileNo.push(obj.objects[i].fileno);
		LfileNoUri.push(appConfig.base_url_ta + obj.objects[i].resource_uri);
		listW.push(obj.objects[i].w);
	}
	return [LfileNo, LfileNoUri,listW];
}

function getMultiSearchNo(Lw){	
	//var obj = getRequest(appConfig.base_url_ta + "/api/v1/searchno/?w=" + Lw);
	var obj = getRequest(appConfig.base_url_ta + "/api/v1/searchno/?limit=0&w=" + Lw);

	LsearchNo = [];
	LsearchNoUri = [];
	listW = [];
	
	var count = obj.meta.total_count;
	for(i=0; i<count;i++){
		LsearchNo.push(obj.objects[i].searchno);
		LsearchNoUri.push(appConfig.base_url_ta +  obj.objects[i].resource_uri);
		listW.push(obj.objects[i].w);
	}
	return [LsearchNo, LsearchNoUri,listW];
}

function getFileNo(keyword){	
	var fileNo = 0;
	var fileNoUri = "";
	
	var obj = getRequest(appConfig.base_url_ta + "/api/v1/fileno/?w=" + keyword);

	if (obj.meta.total_count > 0) {
		fileNo =  obj.objects[0].fileno;
		fileNoUri = appConfig.base_url_ta + obj.objects[0].resource_uri;
	}

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
	
	// Extract hash value and search number
	hashVal = res.substring(1, hashLength);
	searchNo = res.substring(hashLength+1,res.length);
	
	return [hashVal,searchNo];
}

// Flatten json object - in progress
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
      var st_date = new Date();
      var st_time = st_date.getTime();
	  
	  var KeyG = appConfig.KeyG;
	  var Kenc = appConfig.key_encrypt; //Key for encrypting json object
      
	  var file_id = hash(Math.random().toString(36).substring(7));
	  console.log("file id:",file_id);
      uploadFile(event.target.result,file_id,KeyG,Kenc);
  	  console.log("event.target.result:",event.target.result);
	  
      var end_date = new Date();
      var end_time = end_date.getTime();
      var diff = end_time - st_time;
      console.log("Submit process completed. Exec time: ", diff);
      $('#exetime').html("<div class='alert-primary alert'> Exec time: " +  diff + " </div>");
}

//file_content: file content, file_id: file identifier which must be unique, K: symmetric key
function uploadFile(file_content, file_id, KeyG, Kenc){
	var jsonObj = JSON.parse(file_content); //parse json file content into json objects
	console.log("json object:",jsonObj);
	
	console.log("1st item in json object:", Object.keys(jsonObj)[0], Object.values(jsonObj)[0]);
	var first_kv = Object.keys(jsonObj)[0] + Object.values(jsonObj)[0];
	
	var json_keys = Object.keys(jsonObj); // keys of json objects
	var json_values = Object.values(jsonObj); // values of json objects
	var length = json_keys.length; // number of json objects
	var i, w;

	// combine multiple keywords into a list, separated by comma
	var Lw="";
	for(i=0; i< length; i++){
		w = json_keys[i] + json_values[i]
		Lw = Lw + w + ",";
	}
	//remove the last comma
	Lw = Lw.slice(0, -1);
	console.log("list of keywords:",Lw);
	
	processMultiKeyword(Lw,KeyG,Kenc,file_id); //Lw: list of keywords
}

function handleSearchFileLoad(event){
	var KeyG = appConfig.KeyG;	//shared key with TA
	var Kenc = appConfig.key_encrypt; //symmetric key which is used for decryption

	searchFile(event.target.result,KeyG,Kenc);
}

//search_content: search content, K: symmetric key
function searchFile(search_content, KeyG, Kenc){
	var jsonObj = JSON.parse(search_content);
	console.log("json object:",jsonObj);
	var keyword = jsonObj['keyword'];
	console.log("keyword: ",keyword);
	var results = findKeyword(keyword,KeyG,Kenc);
	console.log("Found results:",results);
	return results;
}
//function processMultiKeyword(Lw, KeyG, Kenc, json_id){
function processMultiKeyword(Lw, KeyG, Kenc, json_id){
	var LfileNo;
	var LfileNoUri;
	var listW;
	
	// Retrieve list of file number
	[LfileNo, LfileNoUri,listW] = getMultiFileNo(Lw); //"listW" can be different from Lw. It does not contain new keywords (if existed) in Lw
	console.log("keyword string input:",Lw);
	console.log("List of file numbers: ", LfileNo);
	console.log("List of Url:", LfileNoUri);
	console.log("List of keywords:",listW);
	
	// Compare listW and Lw
	arrLw = Lw.split(",");
	var diff = $(arrLw).not(listW).get();
	console.log("Difference between 2 list of words:",diff);
	listW = listW.concat(diff); //full list of keywords, including existed ones and non-existed ones
	console.log("full list of words:",listW);

	var LsearchNo; // list of search numbers
	var LsearchNoUri; // list of URL to retrieve search numbers
	var tempListWord;
	// Retrieve search number
	[LsearchNo, LsearchNoUri,tempListWord] = getMultiSearchNo(Lw); //"tempListWord" can be empty if all keywords has been never searched
	console.log("Search numbers: ", LsearchNo);
	console.log("Urls: ", LsearchNoUri);
	console.log("list of words in searchno:",tempListWord);
	
	
	objects = '{"objects": ['; //list of objects in PATCH request
	Lcipher = '{"objects": ['; //list of cipher objects in PATCH request
	Laddress='{"objects": [';  //list of address objects in PATCH request

	var l = listW.length; //LfileNo.length can be less than listW.length
	var noExisted = LfileNo.length; // number of existed items
	for(i=0; i<l; i++){
		w = listW[i];
		var searchno;
		if(noExisted>0 && i<noExisted){ // update fileno for existed item
			fileno = LfileNo[i] + 1;
			searchno = LsearchNo[tempListWord.indexOf(w)];
			console.log("index of keyword in the searchno list:",tempListWord.indexOf(w));
			console.log("search number is:",searchno);
			if(searchno === undefined){
				searchno = 0;
			}
		}
		else
		{
			fileno=1;//initialize fileno for new item. File number is counted from 1
			searchno=0;
		}

		
		if(fileno==1){ // If the keyword is new, create fileNo in TA
			console.log('Create new entry in fileNo');
			objects += '{ "w" : "' + w + '","fileno" : ' + fileno + '},';		
		}	
		else{ // If the keyword is existed, update fileNo in TA
			console.log('Update the entry in fileNo');
			objects += '{ "w" : "' + w + '","fileno" : ' + fileno + ',"resource_uri" : "' + LfileNoUri[i] + '"},';	
		}
		
		// Compute the new key
		var hashVal = hash(w);
		KeyW = encrypt(KeyG,hash(w) + searchno);	
		console.log("Keyword:",w," - Hash of keyword:",hashVal," -Search number:",searchno)
		console.log("ciphertext:",KeyW);
		
		// Retrieve ciphertext value from the ciphertext object KeyW
		KeyW_ciphertext = JSON.parse(KeyW).ct;
		console.log("KeyW_ciphertext:",KeyW_ciphertext);
		
		//Encrypt keyword
		var c = encrypt(Kenc, w);
		Lcipher += '{ "jsonId" : "' + json_id + '","data" : ' + c + '},';
		
		// Compute the address in the dictionary
		var addr = hash(KeyW_ciphertext + fileno + "0"); 
		//console.log("type of address:", typeof addr)
		var input = KeyW_ciphertext + fileno + "0";
		console.log("hash input to compute address:",input);
		console.log("Address:" + addr);
		
		// Compute value of entry in the dictionary
//		var val = encrypt(Kenc, json_id + fileno);
		var val = json_id; //do not encrypt json_id anymore
		console.log("json_id:", json_id, " - file number:", fileno, " - value of entry in the dictionary:",val);
		Laddress += '{ "address" : "' + addr + '","value" : "' + val + '"},';
		
	}
	// remove the last comma (,) from objects
	objects = objects.slice(0, -1);
	objects +="]}"
	console.log("objects:", objects)
	
	Lcipher = Lcipher.slice(0,-1);
	Lcipher +="]}"
	console.log("Lcipher:", Lcipher)	
	
	Laddress = Laddress.slice(0,-1);
	Laddress +="]}"
	console.log("Laddress:", Laddress)
	
	// PATCH request (if a keyword is new, create fileNo in TA) and PUT request (if a keyword is existed, update fileNo in TA)
	patchRequest(appConfig.base_url_ta + "/api/v1/fileno/", objects);
	
	// Send ciphertext to CSP 
	patchRequest(appConfig.base_url_sse_server + "/api/v1/ciphertext/", Lcipher);
	
	// Send new address, and value to CSP
	patchRequest(appConfig.base_url_sse_server + "/api/v1/map/", Laddress);
}


function retrieveData(response, Kenc, searchNo, searchNoUri,keyword){
	console.log("response of search:",response.Cfw)
	// decrypt the value to json_id, which is used to request data
	console.log("length of response:",response.Cfw.length)
	
	var found_ret = 0;// the number of found results
	
	for(var j=0; j<response.Cfw.length; j++){
//		var ct = response.Cfw[j]
//		
//		json_id_found = ct;// do not decrypt json_id anymore
//		
//		found_ret = found_ret + 1; // count the number of found results
//
//		// get data by json_id
//		var getresponse = getRequest(appConfig.base_url_sse_server + "/api/v1/ciphertext/?jsonId=" + json_id_found);
//		var objs_data = getresponse["objects"];
//		//console.log("get response:",objs_data)
//		var length = objs_data.length;
//		for (var i = 0; i < length; i++) {
//			console.log("object:",objs_data[i].data);
//			var obj_data_reformat =objs_data[i].data.replace(new RegExp('\'', 'g'), '\"'); //replace ' with "
//			
//			var text = decrypt(Kenc,obj_data_reformat)
//			console.log("decrypted data:",text)
//			//$('#result').append("<div class='alert-primary alert'>" + text + "</div>");
//		}
		var objs_data = response.Cfw[j]
		var length = objs_data.length;

		found_ret = found_ret + 1; // count the number of found results
		for (var i = 0; i < length; i++) {
			var ct = objs_data[i].data
			console.log("encrypted data:",ct)
			var ct_reformat =ct.replace(new RegExp('\'', 'g'), '\"'); //replace ' with "
			var text = decrypt(Kenc,ct_reformat)
			console.log("decrypted data:",text)
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
	
	$('#result').empty();
	$('#result').append("<div class='alert-primary alert'> Found " + found_ret + " results </div>");
	return found_ret;
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
	for(var i=1; i<=fileNo; i++){ // file number is counted from 1
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
	
	result = postRequest(appConfig.base_url_sse_server + "/api/v1/search/", data,function(response){
		return true;
	},async_feat=false);// Send request to CSP
	console.log("Results from post request after returned:",result);
	no_found = retrieveData(result,Kenc,searchNo,searchNoUri,keyword);
	console.log("Results from retrieveData:",no_found);
	return result;
}
/// BASIC FUNCTIONS - End

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
			
			// ADD PATIENT by submitting file
			$("#btnSubmitFile").click(function(){
				if ($('#jsonFile').get(0).files.length === 0) {
				    console.log("No files selected.");
				}
				else{
					//console.log("File submitted");
					var reader = new FileReader()
					reader.onload = handleFileLoad;
					reader.readAsText($('#jsonFile').get(0).files[0]);
				}
				$('#notify').empty();
				$('#notify').html("<div class='alert-primary alert'> Submitted </div>");
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
				$('#notify').empty();
				$('#notify').html("<div class='alert-primary alert'> Submitting </div>");
				
				var y = $("#json-form").serializeArray();
				
				var KeyG = appConfig.KeyG;
				var Kenc = appConfig.key_encrypt; //Key for encrypting json object

				console.log("Number of input fields: ", y.length);
							
				// Generate json_id
				var json_id = hash($("#field1").val() + Math.random().toString(36).substring(7)); //hash($("#patientEmail").val()+ Math.random().toString(36).substring(7));

				for(var i=1; i< noFields; i++){ //when i=0, the field is 'csrf_token'
					var field = y[i];
					console.log("Input field ordering, and value:",i,field);

					var w = (field.name).concat(field.value);
					console.log("Keyword:",w);
					
					processKeyword(w, KeyG, Kenc, json_id);
				}//end for
			});//end btnSubmit
			
			/// SEARCH FOR PATIENT by form
			$('#btnSearch').click(function(){
				$('#result').empty();
				$('#result').html("<div class='alert-primary alert'> Searching </div>");
				
				// Get value of keyword from the search box and the radio box
				var selectVal = $("#searchBy  option:selected").val();
				var keyword = selectVal + $("#keyword").val();
				
				var KeyG = appConfig.KeyG;	
				var Kenc = appConfig.key_encrypt;
				
				console.log("keyword for search", keyword);
				findKeyword(keyword,KeyG,Kenc);		
			});//end btnSearch
			
			/// SEARCH FOR PATIENT by submitting json file
			$('#btnSearchFile').click(function(){
				$('#result').empty();
				$('#result').html("<div class='alert-primary alert'> Searching </div>");
				
				if ($('#jsonSearchFile').get(0).files.length === 0) {
					console.log("No files selected.");
				}
				else{
					//console.log("File submitted");
					var reader = new FileReader()
					reader.onload = handleSearchFileLoad;
					reader.readAsText($('#jsonSearchFile').get(0).files[0]);
				}
				
			});//end btnSearchFile
			
			// in progress
			$('#btnTest').click(function(){
				console.log("testing");
				$('#result').empty();
				$('#result').html("<div class='alert-primary alert'> Testing </div>");
				var Lw = "an,binh,quy";
				var KeyG = appConfig.KeyG;
				var Kenc = appConfig.key_encrypt; //Key for encrypting json object
				processMultiKeyword(Lw, KeyG, Kenc, "1234");
			});
		});