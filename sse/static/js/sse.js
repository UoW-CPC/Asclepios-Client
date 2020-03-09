/// SSE CONFIGURATION
var sseConfig={
	 'base_url_ta' : 'ta_url', //This will be replaced with correct value at runtime at the web server
	 'base_url_sse_server' : 'sse_url',//This will be replaced with correct value at runtime at the web server
	 'salt' : 'salt_value', // salt value for encryption. This will be replaced with correct value at runtime at the web server
	 'iv' : 'iv_value', // iv for encryption. This will be replaced with correct value at runtime at the web server 
	 'iter' : 10000,
	 'ks' : 128,
	 'ts' : 64,
	 'hash_length' : 256
}

/// REQUESTS: Get, Post, Put
function getRequest(api_url) {
	var ret=null;

	$.ajax({
		url: api_url,
		type: 'GET',
		async: false, // disable asynchronous, to wait for the response from the server
		success: function(data) {
			ret = data;
		},
		error: function(erro){
			console.error("Get Request Error");
		}
	})
	return ret;
}

// async_feat: asynchronous (if true) or not (if false)
function postRequest(api_url, jsonObj, callback, async_feat=true) {
	console.log("data:", jsonObj);
	ret = $.ajax({
		url: api_url,
		type: 'POST',
		contentType: 'application/json',
		data: jsonObj,
		async: async_feat,
		success: function(data) {
			if(callback!=undefined){
				callback(data);
			}
		},
		error: function(erro){
			console.error("Post Request Error");
		}
	}).responseJSON;
	return ret;
}


function putRequest(api_url, jsonObj, callback) {
	$.ajax({
		url: api_url,
		type: 'PUT',
		contentType: 'application/json',
		data: jsonObj,
		success: function(data) {
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
// Hash SHA256
function hash(input){
	var bitArray = sjcl.hash.sha256.hash(input);
	var ret = sjcl.codec.hex.fromBits(bitArray);
	return ret;
}

// Encrypt data
// Parameters: input - data, key - symmetric key
function encrypt(key, input){
	var salt = btoa(sseConfig.salt);//btoa("abc123!?");
	var iv = btoa(sseConfig.iv);//btoa("abcdefg");
	//console.log("salt:",salt)
	var options = {mode:"ccm",iter:sseConfig.iter,ks:sseConfig.ks,ts:sseConfig.ts,v:1,cipher:"aes",adata:"",salt:salt, iv:iv}; //define salt, mode for encryption

	var res = sjcl.encrypt(key, input, options);
	return res; // return a ciphertext object
}

// Decrypt a ciphertext object
// Parameters: key - symmetric key, cipherObj - ciphertext object
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

// Retrieve file numbers of a list of keywords
// Params: Lw - list of hashed keywords
function getMultiFileNo(Lw){
	LfileNo = [];
	LfileNoUri = [];
	listW = [];
	
	//var obj = getRequest(appConfig.base_url_ta + "/api/v1/fileno/?w=" + Lw);
	var obj = getRequest(sseConfig.base_url_ta + "/api/v1/fileno/?limit=0&w=" + Lw);//limit=0 allows to get all items
	var count = obj.meta.total_count;
	
	console.log("number of items:",count);
	console.log("request for fileno:",sseConfig.base_url_ta + "/api/v1/fileno/?w=" + Lw);
	
	for(i=0; i<count;i++){
		console.log("Push item of index:",i);
		LfileNo.push(obj.objects[i].fileno);
		LfileNoUri.push(sseConfig.base_url_ta + obj.objects[i].resource_uri);
		listW.push(obj.objects[i].w);
	}
	return [LfileNo, LfileNoUri,listW];
}

//Retrieve search numbers of a list of keywords
//Params: Lw - list of keywords
function getMultiSearchNo(Lw){	
	//var obj = getRequest(sseConfig.base_url_ta + "/api/v1/searchno/?w=" + Lw);
	var obj = getRequest(sseConfig.base_url_ta + "/api/v1/searchno/?limit=0&w=" + Lw);

	LsearchNo = [];
	LsearchNoUri = [];
	listW = [];
	
	var count = obj.meta.total_count;
	for(i=0; i<count;i++){
		LsearchNo.push(obj.objects[i].searchno);
		LsearchNoUri.push(sseConfig.base_url_ta +  obj.objects[i].resource_uri);
		listW.push(obj.objects[i].w);
	}
	
	console.log('List of search no:',LsearchNo)
	return [LsearchNo, LsearchNoUri,listW];
}

/// BASIC FUNCTIONS - END

//Upload data (json object)
//Input: data - data as json object, file_id - file identifier which must be unique, KeyG, Kenc - symmetric keys
function uploadData(data, file_id, KeyG, Kenc){
	console.log("URL TA:",sseConfig.base_url_ta)
	
	console.log("json object:",data);
	
	console.log("1st item in json object:", Object.keys(data)[0], Object.values(data)[0]);
	//var first_kv = Object.keys(data)[0] + "|" + Object.values(data)[0]; //separate key and value by ;
	
	var json_keys = Object.keys(data); // keys of json objects
	var json_values = Object.values(data); // values of json objects
	var length = json_keys.length; // number of json objects
	var i, w;

	// combine multiple hashed keywords into a list, separated by comma
	var Lw=""; //list of hashed keywords
	var L=""; //list of keywords
	for(i=0; i< length; i++){
		w = json_keys[i] + "|" + json_values[i] //separate key and value by ;
		L = L + w + ","; // list of keyword
		Lw = Lw + hash(w) + ","; // list of hashed keyword
	}
	//remove the last comma
	Lw = Lw.slice(0, -1);
	L = L.slice(0, -1);
	console.log("list of uploaded keywords:",L);
	console.log("list of hashed keywords:",Lw);

	var LfileNo;
	var LfileNoUri;
	var listW;
	
	// Retrieve list of file number
	[LfileNo, LfileNoUri,listW] = getMultiFileNo(Lw); //"listW" can be different from Lw. It does not contain new keywords (if existed) in Lw
	console.log("keyword string input:",Lw);
	console.log("List of file numbers: ", LfileNo);
	console.log("List of Url:", LfileNoUri);
	console.log("List of retrieved keywords:",listW);
	
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
	
	arrW = L.split(",");
	for(i=0; i<l; i++){
		w = listW[i]; // hashed of keyword
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
			console.log('Create new entry in fileNo:',w);
			objects += '{ "w" : "' + w + '","fileno" : ' + fileno + '},';		
		}	
		else{ // If the keyword is existed, update fileNo in TA
			console.log('Update the entry in fileNo:',w);
			objects += '{ "w" : "' + w + '","fileno" : ' + fileno + ',"resource_uri" : "' + LfileNoUri[i] + '"},';	
		}
		
		// Compute the new key
		KeyW = encrypt(KeyG,w + searchno);	
		console.log("Keyword:",w," - Hash of keyword:",w," -Search number:",searchno)
		console.log("ciphertext:",KeyW);
		
		// Retrieve ciphertext value from the ciphertext object KeyW
		KeyW_ciphertext = JSON.parse(KeyW).ct;
		console.log("KeyW_ciphertext:",KeyW_ciphertext);
		
		//Encrypt keyword
		kw = arrW[arrLw.indexOf(w)]
		var c = encrypt(Kenc, kw);
		Lcipher += '{ "jsonId" : "' + file_id + '","data" : ' + c + '},';
		
		// Compute the address in the dictionary
		var addr = hash(KeyW_ciphertext + fileno + "0"); 
		//console.log("type of address:", typeof addr)
		var input = KeyW_ciphertext + fileno + "0";
		console.log("hash input to compute address:",input);
		console.log("Address:" + addr);
		
		// Compute value of entry in the dictionary
		var val = file_id; //do not encrypt json_id anymore
		console.log("json_id:", val, " - file number:", fileno, " - value of entry in the dictionary:",val);
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
	patchRequest(sseConfig.base_url_ta + "/api/v1/fileno/", objects);
	
	// Send ciphertext to CSP 
	patchRequest(sseConfig.base_url_sse_server + "/api/v1/ciphertext/", Lcipher);
	
	// Send new address, and value to CSP
	patchRequest(sseConfig.base_url_sse_server + "/api/v1/map/", Laddress);
}

//Decrypt data retrieved from CSP
//Input: response - data retrieved from CSP, Kenc - symmeric key, keyword - the searched keyword
//Output: json object containing count (number of data objects), and objects (list of data objects)
function retrieveData(response, Kenc, searchNo, searchNoUri,keyword){
	console.log("response of search:",response)
	var data;
	if(response == undefined || response.Cfw.length==0 ){ //found 0 results
		found = 0
		data = '{"count":' + found + ',"objects":[]}'
	}
	else{ // found >= 1 results
		found = response.Cfw.length
		console.log("length of response:",found)
		console.log("content of response:",response.Cfw)
	
		data = '"objects":' + '[';
	
		for(var j=0; j<found; j++){
			var objs_data = response.Cfw[j]
			var length = objs_data.length;

			data = data + '{'
			for (var i = 0; i < length; i++) {
				var ct = objs_data[i].data
				console.log("encrypted data:",ct)
				var ct_reformat =ct.replace(new RegExp('\'', 'g'), '\"'); //replace ' with "
				var text = decrypt(Kenc,ct_reformat)
				var pair = text.split("|")
				console.log("decrypted data:",text)
				data =  data + '"' + pair[0] + '":"' + pair[1] + '",'
			}
			//remove the last comma
			data = data.slice(0, -1);
			data = data + '},'
		}
		
		//remove the last comma
		data = data.slice(0, -1);
		data = '{"count":' + found + ',' + data + ']}'
		console.log("Json string:",data)
	}

	// Update search number to TA
	if(searchNo==1){ // If the keyword is new, create searchNo in TA
		var jsonData = '{ "w" : "' + hash(keyword) + '","searchno" : ' + searchNo + '}';
		console.log('Create new entry in searchNo: ',jsonData);
		postRequest(sseConfig.base_url_ta + "/api/v1/searchno/", jsonData);					
	}
	else{ // If the keyword is existed, update searchNo in TA
		console.log('Update the entry in searchno');
		putRequest(searchNoUri,'{ "searchno" : ' + searchNo + '}');
	}	
	return JSON.parse(data);
}


//Search keyword function
//Input: keyword - keyword, KeyG, Kenc - symmetric keys
function findKeyword(keyword, KeyG, Kenc){
	console.log("Search keyword function");
	
	var fileNo, fileNoUri;
	
	// Get file number
	[LfileNo, LfileNoUri,listW] = getMultiFileNo([hash(keyword)]); //"listW" can be different from Lw. It does not contain new keywords (if existed) in Lw
	console.log("Lfileno:",LfileNo)
	if(LfileNo.length>0){
		fileNo = LfileNo[0]
		fileNoUri = LfileNoUri[0]
	}
	else{
		fileNo = 0
		fileNoUri = ""
	}
	
	console.log("file number:",fileNo,", fileNoUri:",fileNoUri)
	
	// Get search number
	var searchNo, searchNoUri;
	[LsearchNo, LsearchNoUri,tempListWord] = getMultiSearchNo([hash(keyword)]); //"listW" can be different from Lw. It does not contain new keywords (if existed) in Lw
	console.log("List of search number:",LsearchNo)
	if(LsearchNo.length>0){
		searchNo = LsearchNo[0]
		searchNoUri = LsearchNoUri[0]
	}
	else{
		searchNo = 0
		searchNoUri = ""
	}

	console.log(" - searchNo: ",searchNo, " - searh number url: ", searchNoUri);
	
	// Compute KeyW
	var KeyW = encrypt(KeyG,hash(keyword)+searchNo); 
	console.log("Search number: ",searchNo," - KeyW: ",KeyW);
	
	// Increase search number:
	searchNo = searchNo + 1; //new
	
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
	console.log("Data sent to CSP:", data);
	
	hashChars = appConfig.hash_length/4; //number of chars of hash output: 64
	
	result = postRequest(appConfig.base_url_sse_server + "/api/v1/search/", data,function(response){
		return true;
	},async_feat=false);// Send request to CSP
	
	console.log("Results from post request after returned:",result);
	data = retrieveData(result,Kenc,searchNo,searchNoUri,keyword);
	console.log("Results from retrieveData:",data);
	
	return data;
}

//Search data
//Input: data - json object of search content, K - symmetric key
function search(data, KeyG, Kenc){
	console.log("json object:",data);
	var keyword = data['keyword'];
	console.log("keyword: ",keyword);
	var results = findKeyword(keyword,KeyG,Kenc);
	return results;
}
