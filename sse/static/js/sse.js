//const $ = require('./jquery-3.4.1.min.js') // for jest automatic testing
//const sjcl = require('./sjcl.js') // for jest automatic testing
//module.exports = [uploadData,search,updateData,deleteData]; // for jest automatic testing

/// SSE CONFIGURATION
HTTP_CODE_CREATED = 201

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
function postRequest(api_url, jsonObj, callback=undefined, async_feat=true) {
	console.log("data:", jsonObj);
	result = $.ajax({
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
	});
	console.log("response of post request:",result);
	return result;
}

//async_feat: asynchronous (if true) or not (if false)
function putRequest(api_url, jsonObj, callback, async_feat=true) {
	$.ajax({
		url: api_url,
		type: 'PUT',
		contentType: 'application/json',
		data: jsonObj,
		async: async_feat,
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
	console.log("Run patch request")
	$.ajax({
		url: api_url,
		type: 'PATCH',
		contentType: 'application/json',
		data: jsonObj,
		success: function(data) {
			//console.log("success patch request")
			if(callback!=undefined){
				//callback(data);
				callback(true); //this serves automatic tests with jest 
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
	
	var obj = getRequest(sseConfig.base_url_ta + "/api/v1/fileno/?w=" + Lw);
	//var obj = getRequest(sseConfig.base_url_ta + "/api/v1/fileno/?limit=0&w=" + Lw);//limit=0 allows to get all items
	//console.log("request for fileno:",sseConfig.base_url_ta + "/api/v1/fileno/?w=" + Lw);
	console.log("response:",obj);
	var count = obj.meta.total_count;
	
	console.log("number of items:",count);
	
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
	var obj = getRequest(sseConfig.base_url_ta + "/api/v1/searchno/?w=" + Lw);
	//var obj = getRequest(sseConfig.base_url_ta + "/api/v1/searchno/?limit=0&w=" + Lw);

	LsearchNo = [];
	LsearchNoUri = [];
	listW = [];
	
	var count = obj.meta.total_count;
	for(i=0; i<count;i++){
		LsearchNo.push(obj.objects[i].searchno);
		LsearchNoUri.push(sseConfig.base_url_ta +  obj.objects[i].resource_uri);
		listW.push(obj.objects[i].w); //list of keyword, which No.Search exists
	}
	
	console.log('List of search no:',LsearchNo)
	return [LsearchNo, LsearchNoUri,listW];
}

/// BASIC FUNCTIONS - END

//Upload data (json object)
//Input: data - data as json object, file_id - file identifier which must be unique, KeyG, Kenc - symmetric keys
function uploadData(data, file_id, KeyG, Kenc,callback){
	// verify if file_id existed
	var ret = getRequest(sseConfig.base_url_sse_server + "/api/v1/ciphertext/?limit=1&jsonId="+file_id);
	if (ret.meta['total_count']>0){
		console.log("Existed file id")
		return false;
	}

	console.log("New file id")
	console.log("URL TA:",sseConfig.base_url_ta)
	
	console.log("json object:",data);
	
	console.log("1st item in json object:", Object.keys(data)[0], Object.values(data)[0]);
	
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
		if(noExisted>0 && i<noExisted) // update fileno for existed item
			fileno = LfileNo[i] + 1;
		else
			fileno=1;//initialize fileno for new item. File number is counted from 1

		searchno = LsearchNo[tempListWord.indexOf(w)];
		console.log("index of keyword in the searchno list:",tempListWord.indexOf(w));
		console.log("search number is:",searchno);
		if(searchno === undefined){ //if not found
			searchno = 0;
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
		console.log(" - Hash of keyword:",w," -Search number:",searchno)
		console.log("ciphertext:",KeyW);
		
		// Retrieve ciphertext value from the ciphertext object KeyW
		KeyW_ciphertext = JSON.parse(KeyW).ct;
		console.log("KeyW_ciphertext:",KeyW_ciphertext);
		
		//Encrypt keyword
		kw = arrW[arrLw.indexOf(w)]
		var c = encrypt(Kenc, kw);
		Lcipher += '{ "jsonId" : "' + file_id + '","data" : ' + c + '},';
		
		// Compute the address in the dictionary
		var input = KeyW_ciphertext + fileno + "0";
		var addr = hash(input); 
		//console.log("type of address:", typeof addr)
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
	patchRequest(sseConfig.base_url_ta + "/api/v1/fileno/", objects,callback);
	console.log("send patch request to TA:",sseConfig.base_url_ta + "/api/v1/fileno/",objects)
	// Send ciphertext to CSP 
	patchRequest(sseConfig.base_url_sse_server + "/api/v1/ciphertext/", Lcipher,callback);
	
	// Send new address, and value to CSP
	patchRequest(sseConfig.base_url_sse_server + "/api/v1/map/", Laddress,callback);
	
	return true;
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

	// Update search number to TA in both cases: found, and not found
	if(searchNo==1){ // If the keyword is new, create searchNo in TA
		var jsonData = '{ "w" : "' + hash(keyword) + '","searchno" : ' + searchNo + '}';
		console.log('Create new entry in searchNo: ',jsonData);
		postRequest(sseConfig.base_url_ta + "/api/v1/searchno/", jsonData, undefined, async_feat = false);	//async_feat=true to searve jest automatic testing				
	}
	else{ // If the keyword is existed, update searchNo in TA
		console.log('Update the entry in searchno');
		putRequest(searchNoUri,'{ "searchno" : ' + searchNo + '}', undefined, async_feat = false); //async_feat=true to searve jest automatic testing	
	}	
	return JSON.parse(data);
}

// Decrypt data
function decryptData(cipherList, Kenc){
	var found = cipherList.length;
	console.log("length of list:",found)
	console.log("ciphertext list:",cipherList)
	
	var data=[];
	
	for(var j=0; j<found; j++){
		var ct = cipherList[j].data
		console.log("encrypted data:",ct)
		var ct_reformat =ct.replace(new RegExp('\'', 'g'), '\"'); //replace ' with "
		var text = decrypt(Kenc,ct_reformat)
		console.log("decrypted data:",text)
		data.push(text);
	}

	console.log("List of plaintexts:",data)
	return data;
}

//Search keyword function
//Input: keyword (string) - keyword, KeyG, Kenc - symmetric keys
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
		console.log("Exists search no")
	}
	else{
		searchNo = 0
		searchNoUri = ""
		console.log("Does not exist search no")
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
	
	var data = '{ "KeyW" : ' + KeyW + ',"fileno" : ' + fileNo + ',"Lu" :[' + arrayAddr + ']}';
	console.log("Data sent to CSP:", data);
	
	hashChars = sseConfig.hash_length/4; //number of chars of hash output: 64
	
	console.log("Sent search request:",sseConfig.base_url_sse_server + "/api/v1/search/")
	result = postRequest(sseConfig.base_url_sse_server + "/api/v1/search/", data,function(response){
		return true;
	},async_feat=false);// Send request to CSP
	
	console.log("Results from post request after returned:",result.responseJSON);
	data = retrieveData(result.responseJSON,Kenc,searchNo,searchNoUri,keyword);
	console.log("Results from retrieveData:",data);
	
	return data;
}

//Search data
//Input: data - json object of search content, KeyG, Kenc - symmetric keys
function search(data, KeyG, Kenc){
	console.log("json object:",data);
	var keyword = data['keyword'];
	if(keyword==undefined){
		console.log("Invalid input file")
		return null;
	}
	console.log("keyword: ",keyword);
	var results = findKeyword(keyword,KeyG,Kenc);
	return results;
}

// offset: the amount of increase in No.Search
function computeListKeyW(Lhash,KeyG,LsearchNo,offset=0){
	//Compute list of KeyW
	var input, addr;
	var LkeyW=[];
	var length = Lhash.length;
	for(i=0; i<length;i++){//for each keyword
		// Compute the key
		w = Lhash[i];
		searchno = LsearchNo[i] + offset;
		if(searchno === undefined){ //if not found
			searchno = 0;
		}
		KeyW = encrypt(KeyG,w + searchno);	
		console.log("- Hash of keyword:",w," -Search number:",searchno)
		console.log("ciphertext:",KeyW);
		
		LkeyW.push(KeyW);
	}
	return LkeyW;
}

// offset = 0 if computeAddr without changing No.File, offset = 1 if computeAddr with No.File = No.File + 1
function computeAddr(Lhash,LkeyW,LfileNo,offset=0){
	var input, addr;
	var Laddr=[], L;
	var length = Lhash.length;
	
	for(i=0; i<length;i++){//for each keyword
		// Retrieve ciphertext value from the ciphertext object KeyW
		KeyW_ciphertext = JSON.parse(LkeyW[i]).ct;
		console.log("KeyW_ciphertext:",KeyW_ciphertext);
		
		fileno = LfileNo[i]
		if(fileno==undefined){ //if not found, i.e. completely new keyword --> (not yet) check if this step is necessary
			fileno=0
		}
	
		if(offset==0){ //compute current addresses
			start = 1
		}
		else{ //compute new address
			fileno = fileno + 1
			start = fileno
		}
		console.log("New No.Files:",fileno)
		
		L = [];
		for(j=start; j<=fileno;j++){ // for each index from start to fileno. The loop works  in case offset=1, and does not work in case offset=0
			input = KeyW_ciphertext + j + "0";
			addr = hash(input); 
			console.log("hash input to compute address:",input);
			console.log("Address:" + addr);
			L.push('"' + addr + '"');
		}
		console.log("length of list:",L.length)
		if(L.length!=0){
			Laddr.push('['+L+']');
		}
	}
	return Laddr;
}

function encryptList(Lkeyword,Kenc){
	var length = Lkeyword.length;
	
	var Lcipher = []
	for(i=0; i<length;i++){//for each keyword
		c = encrypt(Kenc, Lkeyword[i]);
		Lcipher.push(c);
	}
	
	return Lcipher
}

//offset: the amount of addition or subtraction from the current fileno
function updateFileNo(Lhash,LfileNoUri,LfileNo,offset){
	var objects = '';
	var length = Lhash.length;
	
	var del=false // if delete fileno or not
	if(offset<0){
		deleted_objects = '[';
		delete_searchno = '[';
	}
	
	var update = false //if update an existed entry, or add new entry
	var new_fileno,w, fileno;
	
	for(i=0;i<length;i++){ //loop over keywords
		fileno= LfileNo[i]
		new_fileno = fileno + offset
		w=Lhash[i]
		if(new_fileno<=0){ // Subtraction: If after update, there is no file containing the keyword
			console.log('Delete an entry in fileNo:',w);
			del=true
			deleted_objects +='"' + LfileNoUri[i] + '",';
		}	
		else if(fileno==0){ //&& fileno+offset>0, Addition: if after update, there exists file conatining the keyword
			update = true
			console.log('Add new entry in fileNo:',w);
			objects += '{ "w" : "' + w + '","fileno" : ' + new_fileno + '},';
		}
		else { // Update an existed entry in fileno
			update = true
			console.log('Update existed entry in fileNo:',w);
			objects += '{ "w" : "' + w + '","fileno" : ' + new_fileno + ',"resource_uri" : "' + LfileNoUri[i] + '"},';	
		}
	}
	
	// remove the last comma (,) from objects
	if(update==true)
		objects = objects.slice(0, -1);	
	console.log("objects in fileno:", objects)
	
	if(del==true){ // delete only, or both update and delete
		deleted_objects = deleted_objects.slice(0, -1)+']';
		console.log("deleted_objects in fileno:", deleted_objects)
	}
	else
		deleted_objects = deleted_objects + ']';

	return [del,objects,deleted_objects]
}

// Lexisted is equal or subset of Lhash
function createFullList(Lhash,Lexisted_hash,Lfound){
	console.log("createFullList function")
	console.log("Lhash:",Lhash)
	console.log("Lhash.length:",Lhash.length)
	
	var length = Lhash.length;
	
	// build list of every keyword
	Lfull=[]
	for(i=0; i<length;i++){//for each keyword
		idx = Lexisted_hash.indexOf(Lhash[i]); //find if Lhash[i] exists in Lexisted_hash
		found = Lfound[idx]; // retrieve search no/ fileno of Lhash[i] (if existed)
		console.log("index of keyword in the found list:",idx);
		if(found==undefined){ //if not found
			found=0
		}
		console.log("found number is:",found);
		Lfull.push(found);
	}
	
	return Lfull;
}

//Update data:
// Data = { att1:[current_value,new_value], att2:[current_value,new_value] }
function updateData(data, file_id, KeyG, Kenc, callback){
	// Based on {att:current_value}, request for No.Files, No.Search
	console.log("Updating data")
	var keys =Object.keys(data)
	console.log("key:",keys)
	var length = keys.length; // number of update fields
	var values = Object.values(data)
	console.log("values:",values)
		
	Lcurrent_value=[];
	Lnew_value=[];
	Lcurrent_hash = [];
	Lnew_hash=[];
	for(i=0; i<length;i++){
		current_value = keys[i] + '|' + values[i][0];
		new_value = keys[i] + '|' + values[i][1];
		console.log("current value:", current_value, " - new value:",new_value)
		Lcurrent_value.push(current_value);
		Lcurrent_hash.push(hash(current_value));
		Lnew_value.push(new_value);
		Lnew_hash.push(hash(new_value));
	}
	
	console.log("List of current values:",Lcurrent_value);
	console.log("List of hashes:",Lcurrent_hash);
	
	console.log("List of new values:",Lnew_value);
	console.log("List of new hashes:",Lnew_hash);
	
	// Get file number
	Lcurrent_fileNo = [];
	Lcurrent_fileNoUri = [];
	current_listW = [];
	[Lcurrent_fileNo, Lcurrent_fileNoUri,current_listW] = getMultiFileNo(Lcurrent_hash);
	
	if(Lcurrent_fileNo.length<length){ //at least 1 keyword is not found in No.Files
		console.log("At least one of update field does not exist in database")
		return false;
	}

	console.log("Lfileno of current keywords:",Lcurrent_fileNo)

	// Get search number	
	Lall_found_searchNo = [];
	Lall_searchNoUri = [];
	all_tempListWord = [];
	Lall_hash = Lcurrent_hash.concat(Lnew_hash); //combine Lcurrent_hash and Lnew_hash
	[Lall_found_searchNo,Lall_searchNoUri,all_tempListWord]=getMultiSearchNo(Lall_hash);
	console.log("Lall_found_searchNo:",Lall_found_searchNo);
	console.log("all_tempListWord:",all_tempListWord);
	console.log("Lcurrent_hash:",Lcurrent_hash);
	
	// get the full list of search no of current keywords, which invole keywords with no search = 0
	// (not yet) to be improved: compare length of 2 list before calling function
	Lcurrent_searchNo = createFullList(Lcurrent_hash,all_tempListWord,Lall_found_searchNo);
	console.log("Lcurrent_searchNo:",Lcurrent_searchNo);
	
	Lcurrent_keyW = computeListKeyW(Lcurrent_hash,KeyG,Lcurrent_searchNo); // compute current list of KeyW
	Ltemp_keyW = computeListKeyW(Lcurrent_hash,KeyG,Lcurrent_searchNo,1); // compute list of KeyW with searchno = searchno + 1
	console.log("List of current KeyW lists:",Lcurrent_keyW);
	console.log("List of temp KeyW lists:",Ltemp_keyW);
	
	Ltemp_addr = computeAddr(Lcurrent_hash,Ltemp_keyW,Lcurrent_fileNo); // compute temp addresses
	console.log("List of temp address:",Ltemp_addr);
	console.log("temp length, key length:",Ltemp_addr.length,length)
	
	// Get file no of the new keywords	
	Lnew_fileNo = [];
	Lnew_fileNoUri = [];
	new_listW = [];
	[Lnew_found_fileNo, Lnew_fileNoUri,new_listW] = getMultiFileNo(Lnew_hash); 

	// Build full list of No.File of every keyword
	Lnew_fileNo = createFullList(Lnew_hash,new_listW,Lnew_found_fileNo)
	console.log("Lfileno of current keywords:",Lnew_fileNo)

	// get the full list of search no of new keywords, which invole keywords with no search = 0
	Lnew_searchNo=createFullList(Lnew_hash,all_tempListWord,Lall_found_searchNo)

	Lnew_keyW = computeListKeyW(Lnew_hash,KeyG,Lnew_searchNo); // compute new list of KeyW
	Lnew_addr = computeAddr(Lnew_hash,Lnew_keyW,Lnew_fileNo,1); // compute new addresses with No.Files = No.Files + 1
	console.log("List of new KeyW:",Lnew_keyW);
	console.log("List of new address lists:",Lnew_addr);

	// Encrypt new values
	Lcurrent_cipher = encryptList(Lcurrent_value,Kenc);
	Lnew_cipher = encryptList(Lnew_value,Kenc);

	var data = '{"file_id":"' + file_id + '","LkeyW" :[' + Lcurrent_keyW + '],"Lfileno" :[' + Lcurrent_fileNo + '],"Ltemp" :[' + Ltemp_addr + '],"Lnew" :[' + Lnew_addr + '],"Lcurrentcipher" :['+ Lcurrent_cipher + '],"Lnewcipher" :['+ Lnew_cipher +']}';
	console.log("Data sent to CSP:", data);

	console.log("Sent update request:",sseConfig.base_url_sse_server + "/api/v1/update/")
	result = postRequest(sseConfig.base_url_sse_server + "/api/v1/update/", data,function(response){
		return true;
	},async_feat=false);// Send request to CSP

	console.log("Response of update:",result.status)

	if(result.status==HTTP_CODE_CREATED){
		//Update No.Files at TA
		// PATCH request (if a keyword is new, create fileNo in TA) and PUT request (if a keyword is existed, update fileNo in TA)
		console.log("Decrease current No.Files at TA")
		var current_del,current_objects,current_deleted_objects,delete_current_searchno;
		
		// not yet: check if remove delete_current_searchno is fine or not
		[current_del,current_objects,current_deleted_objects,delete_current_searchno]=updateFileNo(Lcurrent_hash,Lcurrent_fileNoUri,Lcurrent_fileNo,-1);

		console.log("Increase new No.Files at TA")
		var new_del,new_objects,new_deleted_objects,delete_new_searchno;
		// not yet: check if remove delete_new_searchno is fine or not
		[new_del,new_objects,new_deleted_objects,delete_new_searchno]=updateFileNo(Lnew_hash,Lnew_fileNoUri,Lnew_fileNo,1);

		// update No.Files
		objects = '"objects":[';
		if(current_objects!=[])
			objects += current_objects;
		if(new_objects!=[])
			if(current_objects!=[])
				objects += ",";
		objects += new_objects;
		objects += ']';

		if(current_del == true) //if needs to delete
			data = '{' + objects + ',"deleted_objects":' + current_deleted_objects + '}'		
		else // add and update only 
			data = '{' + objects + '}'

		console.log("data sent to update fileno:", data)
		patchRequest(sseConfig.base_url_ta + "/api/v1/fileno/", data, callback);
	}
	return true;
}

//Update data
function deleteData(file_id, KeyG, Kenc, callback){
	// Send GET request to CSP to retrieve ciphertext of data belonging to file_id
	var obj = getRequest(sseConfig.base_url_sse_server + "/api/v1/ciphertext/?jsonId=" + file_id);
	console.log("response:",obj);
	var length = obj.meta.total_count;
	if(length==0){
		console.log("File_id does not exist");
		return false;
	}
	else{
		console.log("File_id exists");
		// Decrypt data
		var pt = decryptData(obj.objects,Kenc);
		// Send GET request to TA to retrieve fileno
		// combine multiple hashed keywords into a list, separated by comma
		var Lw=[]; //list of hashed keywords
		var Lcipher=[];
		
		// retrieve data from Map table by file_id
		var objMap = getRequest(sseConfig.base_url_sse_server + "/api/v1/map/?value=" + file_id);
		console.log("objects in map table:",objMap);
		for(i=0; i< length; i++){
			w = pt[i];
			Lw.push(hash(w));
			Lcipher.push('"'+obj.objects[i].data+'"');
		}

		console.log("list of hashed keywords:",Lw);
		
		// Retrieve list of file number
		[LfileNo, LfileNoUri,listW] = getMultiFileNo(Lw); //"listW" can be different from Lw. It does not contain new keywords (if existed) in Lw
		console.log("keyword string input:",Lw);
		console.log("List of file numbers: ", LfileNo);
		console.log("List of Url:", LfileNoUri);
		console.log("List of retrieved keywords:",listW);
		
		//var arrLw = Lw.split(",");
		var listFileNo;
		if(Lw.length > listW.length)
			listFileNo=createFullList(Lw,listW,LfileNo);
		else
			listFileNo=LfileNo;

		console.log("full list of file no of keywords:",listFileNo);
		// Retrieve search number
		
		[LsearchNo, LsearchNoUri,tempListWord] = getMultiSearchNo(Lw); //"tempListWord" can be empty if all keywords has been never searched
		console.log("Search numbers: ", LsearchNo);
		console.log("Urls: ", LsearchNoUri);
		console.log("list of words in searchno:",tempListWord);

		var listSearchNo;
		if(Lw.length > tempListWord.length)
			listSearchNo=createFullList(Lw,tempListWord,LsearchNo);
		else
			listSearchNo=LsearchNo;
		console.log("full list of search no of keywords:",listSearchNo);
		
		LkeyW = computeListKeyW(Lw,KeyG,listSearchNo); // compute list of KeyW with searchno = searchno + 1
		Ltemp_keyW = computeListKeyW(Lw,KeyG,listSearchNo,1); // compute list of KeyW with searchno = searchno + 1
		
		console.log("List of KeyW lists:",LkeyW);
		
		Laddr = computeAddr(Lw,Ltemp_keyW,listFileNo); // compute addresses
		console.log("List of address:",Laddr);
		
		var data = '{"file_id":"' + file_id + '","LkeyW" :[' + LkeyW + '],"Lfileno" :[' + LfileNo + '],"Ltemp" :['+ Laddr +'],"Lcipher" :['+ Lcipher +']}';
		console.log("Data sent to CSP:", data);

		console.log("Sent delete request:",sseConfig.base_url_sse_server + "/api/v1/delete/")
		result = postRequest(sseConfig.base_url_sse_server + "/api/v1/delete/", data,function(response){
			return true;
		},async_feat=false);// Send request to CSP
		
		// Send PATCH request to TA to update/delete entries in fileno table
		var current_del,current_objects,current_deleted_objects;
		[current_del,current_objects,current_deleted_objects]=updateFileNo(Lw,LfileNoUri,LfileNo,-1);

		console.log("deleted objects in fileno table:",current_deleted_objects);
		// update No.Files
		var objects = '"objects":[';
		if(current_objects!=[])
			objects += current_objects;
		objects += ']';

		if(current_deleted_objects != []) //if needs to delete
			data = '{' + objects + ',"deleted_objects":' + current_deleted_objects + '}'		
		else // add and update only 
			data = '{' + objects + '}'

		console.log("data sent to update fileno:", data)
		patchRequest(sseConfig.base_url_ta + "/api/v1/fileno/", data, callback);

	}
	return true;
}

