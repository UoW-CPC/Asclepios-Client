/////////////////////// CONFIGURATION FOR AUTOMATIC TESTS WITH JEST- Start ///////////////////////
//const $ = require('./jquery-3.4.1.min.js') // for jest automatic testing
//const sjcl = require('./sjcl.js') // for jest automatic testing
//module.exports = [uploadData,search,updateData,deleteData,uploadKeyG,encryptUploadBlob,downloadDecryptBlob]; // for jest automatic testing
/////////////////////// CONFIGURATION FOR AUTOMATIC TESTS WITH JEST- End ///////////////////////


/////////////////////// CONFIGURATION FOR AUTOMATIC BENCHMARK TESTS WITH JEST- Start ///////////////////////
/// For benchmarking
//let sjcl = require('./sjcl'); 
//let btoa = require('../../../Benchmark/node_modules/btoa');
//let dom = new (require('../../../Benchmark/node_modules/jsdom').JSDOM)(' '); // create mock document for jquery
//let $ = require('../../../Benchmark/node_modules/jquery')(dom.window);
//exports.uploadData = uploadData;
//exports.updateData = updateData;
//exports.search = search;
//exports.uploadKeyG = uploadKeyG;
/////////////////////// CONFIGURATION FOR AUTOMATIC BENCHMARK TESTS WITH JEST- End ///////////////////////


/////////////////////// SSE CONFIGURATION - Start ///////////////////////
HTTP_CODE_CREATED = 201

var sseConfig={
	 'base_url_ta' : 'ta_url', //This will be replaced with correct value at runtime at the web server
	 'base_url_sse_server' : 'sse_url',//This will be replaced with correct value at runtime at the web server
	 'salt' : 'ZRVja4LFrFY=', // salt value for encryption. This will be replaced with correct value at runtime at the web server
	 'iv' : 'n2JUTJ0/yrI=', // iv for encryption. This will be replaced with correct value at runtime at the web server 
	 'iter' : 10000, // number of iteration for generating key from passphrase
	 'ks' : 128, // key size
	 'ts' : 64, // tag size
	 'mode' : 'ccm', // encryption mode
	 'adata':'',
	 'adata_len' : 0,
	 'cipher' : 'aes',
	 'hash_length' : 256,
	 'chunk_size' : 32768,//size of 1 slice/ chunk for encryption (in uint8 items), 32768=1024^32
	 'no_chunks_per_upload' :30, //number of chunks to be packed in 1 upload
	 'salt_sgx' : 'ZRVja4LFrFY=', // {base64, 8 bytes} salt value for encryption. This will be replaced with correct value at runtime at the web server
	 'iv_sgx' : 'n2JUTJ0/yrI=', // {base64, 8 bytes} iv for encryption. This will be replaced with correct value at runtime at the web server 
	 'iter_sgx' : 10000,
	 'ks_sgx' : 128, //{128 bits} it is set 128 bits to be compatible with AES encryption in SGX
	 'ts_sgx' : 64,
	 'mode_sgx' : 'ccm',
	 'adata_sgx':'',
	 'adata_len_sgx' : 0,
	 'cipher_sgx' : 'aes',
}
/////////////////////// SSE CONFIGURATION - End ///////////////////////

/////////////////////// REQUESTS - Start ///////////////////////
/**
 * GET request which is asynchronous
 * 
 * @param {string} api_url The URL
 * @return {json} data Returned data
 */
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

/**
 * POST request
 * 
 * @param {string} api_url The URL
 * @param {json} jsonObj The sent data
 * @param {callback} callback The function to be executed when calling back. This is used for automatic testing with Jest.
 * @param {boolean} async_feat True if asynchronous, False if synchronous
 */
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

/**
 * PUT request
 * 
 * @param {string} api_url The URL
 * @param {json} jsonObj The sent data
 * @param {callback} callback The function to be executed when calling back. This is used for automatic testing with Jest.
 * @param {boolean} async_feat True if asynchronous, False if synchronous
 */
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

/**
 * PATCH request
 * 
 * @param {string} api_url The URL
 * @param {json} jsonObj The sent data
 * @param {callback} callback The function to be executed when calling back. This is used for automatic testing with Jest.
 * @param {boolean} async_feat True if asynchronous, False if synchronous
 */
function patchRequest(api_url, jsonObj, callback, async_feat=true) {
	console.log("Run patch request")
	$.ajax({
		url: api_url,
		type: 'PATCH',
		contentType: 'application/json',
		data: jsonObj,
		async: async_feat,
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
/////////////////////// REQUESTS - End ///////////////////////

/////////////////////// BASIC FUNCTIONS - Start ///////////////////////

/**
 * Hash function (hash 256 bits)
 * 
 * @param {string} input Input data
 * @return {string} ret Hashed value (in hex string)
 */
function hash(input){
	var bitArray = sjcl.hash.sha256.hash(input);
	var ret = sjcl.codec.hex.fromBits(bitArray);
	return ret;
}

/**
 * Encrypt data
 * 
 * @param {string} key Key or passphrase // needed test
 * @param {string} input Plaintext
 * @return {object} res Ciphertext object
 */
function encrypt(key, input){
	var salt = btoa(sseConfig.salt);
	var iv = btoa(sseConfig.iv);
	//var salt = sjcl.codec.base64.toBits(sseConfig.salt); // needed test
	//var iv = sjcl.codec.base64.toBits(sseConfig.iv); // needed test
	var options = {mode:"ccm",iter:sseConfig.iter,ks:sseConfig.ks,ts:sseConfig.ts,v:1,cipher:"aes",adata:"",salt:salt, iv:iv}; //define salt, mode for encryption
	//var options = {mode:sseConfig.mode,iter:sseConfig.iter,ks:sseConfig.ks,ts:sseConfig.ts,v:1,cipher:sseConfig.cipher,adata:sseConfig.adata,salt:salt, iv:iv}; //needed test

	var res = sjcl.encrypt(key, input, options);
	return res; // return a ciphertext object
}

/**
 * Decrypt data
 * 
 * @param {string} key Key or passphrase //needed test
 * @param {object} cipherObj Ciphertext object
 * @return {string} res Decrypted data (plaintext) //needed test
 */
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

/**
 * Retrieve file numbers/ search numbers of a list of keywords
 * 
 * @param {string} requestType "searchno" if retrieving search numbers, "fileno" if retrieving file numbers
 * @param {list} Lw The list of keywords
 * @param {string} keyid The key identification
 * @return {list} [Lno,LnoUri,listW] The list of search/file numbers, the list of URI of search/file numbers, the list of keywords which file number/search number exist
 */
function getMultiFileOrSearchNo(requestType,Lw,keyid){	
	var data_ta = JSON.stringify({"requestType": requestType,"Lw":Lw,"keyId":keyid});
	console.log("Invoke longrequest")
	console.log(data_ta)
	var ret = postRequest(sseConfig.base_url_ta + "/api/v1/longrequest/",data_ta,callback=undefined,async_feat=false);

	var obj = ret.responseJSON;
	console.log(obj);
	Lno = [];
	LnoUri = [];
	listW = [];
	
	var count = obj.objects.length;
	for(i=0; i<count;i++){
		if(requestType=="searchno")
			Lno.push(obj.objects[i].searchno);
		else
			Lno.push(obj.objects[i].fileno);
		LnoUri.push(sseConfig.base_url_ta +  "/api/v1/" + requestType + "/"+ obj.objects[i].id+"/");
		listW.push(obj.objects[i].w); //list of keyword, which No.Search exists
	}
	console.log('List of no:',Lno)
	console.log('List of uri:',LnoUri)
	console.log('list of w:',listW)
	return [Lno, LnoUri,listW];
}
/////////////////////// BASIC FUNCTIONS - End ///////////////////////

/////////////////////// SSE FUNCTIONS - Start ///////////////////////

/**
 * Encrypt data (json object) at SSE client, and upload the ciphertext to SSE Server (CSP)
 * 
 * @param {json} data Input data
 * @param {string} file_id Unique identification of the data object
 * @param {string} sharedKey Key or passphrase for key generation. The key will be shared with SSE TA for verification//needed test
 * @param {string} Kenc Key or passphrase for key generation. The key will be used for data encryption //needed test
 * @param {callback} callback Callback function. This is used for automatic test with Jest
 * @return {boolean} false/true False if error, True if successful
 */
function uploadData(data, file_id, sharedKey, Kenc, keyid, callback){
	if(data=={} || file_id=="" || sharedKey=="" || Kenc=="" || keyid==""){
		console.log("Lack of parameter of uploadData function")
		return false;
	}
	// verify if file_id existed
	var ret = getRequest(sseConfig.base_url_sse_server + "/api/v1/ciphertext/?limit=1&jsonId="+file_id+"&keyId="+keyid);
	if (ret.meta['total_count']>0){
		console.log("Existed file id")
		return false;
	}

	var KeyG = computeKeyG(sharedKey);
	//console.log("KeyG in upload:",KeyG);
	var key = hash(Kenc); //generate encryption key from inputed passphrase Kenc

	console.log("URL TA:",sseConfig.base_url_ta)
	
	console.log("json object:",data);
	
	console.log("1st item in json object:", Object.keys(data)[0], Object.values(data)[0]);
	
	var json_keys = Object.keys(data); // keys of json objects
	var json_values = Object.values(data); // values of json objects
	var length = json_keys.length; // number of json objects
	var i, w;

	var listHw=[], arrW=[]; //listHw be the list of hashed keywords, arrW be the list of keywords
	for(i=0; i< length; i++){
		w = json_keys[i] + "|" + json_values[i] //separate key and value by ;
		arrW.push(w);//list of keyword
		listHw.push(hash(w)) ; // list of hashed keyword
	}
	
	console.log("list of uploaded keywords:",arrW);
	console.log("list of hashed keywords:",listHw);
	
	var data_ta = JSON.stringify({"Lw":listHw,"keyId":keyid});
	console.log("Data sent to TA:",data_ta);
	
	// Request meta data fileNo and searchNo from TA, and increase fileNo for uploaded keywords
	// If a keyword is new, create fileNo in TA; if a keyword is existed, update fileNo in TA
	console.log("Send post request to TA from object:",data); // for testing
	var ta_response=postRequest(sseConfig.base_url_ta + "/api/v1/upload/", data_ta, undefined, false);
	
	var json_response = ta_response.responseJSON;
	var Lfileno = ta_response.responseJSON["Lfileno"];
	var Lsearchno = ta_response.responseJSON["Lsearchno"];
	console.log("data back from TA:",Lfileno,Lsearchno);
	
	var Lcipher = '{"objects": ['; //list of cipher objects in PATCH request
	var Laddress='{"objects": [';  //list of address objects in PATCH request

	var l = listHw.length; //LfileNo.length can be less than listW.length
	var searchno, fileno, item, kw;
	for(i=0; i<l; i++){ // For all keywords
		hw = listHw[i]; // hashed of keyword
		var len = Lfileno.length;
		var item,element;
		for(j=0; j<len; j++){
			element = Lfileno[j];
			if(element.w==hw){
				item=element;
				j=len;
			}
		}

		console.log("found item:",item);
		fileno  = item.fileno;
		console.log("found fileno:",fileno);
		
		// retrieve searchNo of the keyword
		len = Lsearchno.length;
		for(j=0; j<len; j++){
			element = Lsearchno[j];
			if(element.w==hw){
				item=element;
				searchno = item.searchno;
				j=len+1; // exit For loop
			}
		}
		if(j==len) // not found searchno
			searchno = 0;

		// Compute the key KeyW
		KeyW = encrypt(KeyG,hw + searchno);	
		console.log(" - Hash of keyword:",hw," -Search number:",searchno)
		console.log("KeyW object:",KeyW);
		
		// Retrieve ciphertext value from the ciphertext object KeyW
		KeyW_ciphertext = JSON.parse(KeyW).ct;
		console.log("KeyW_ciphertext:",KeyW_ciphertext);
		
		//Encrypt keyword
		kw = arrW[i];
		var c = encrypt(key, kw);
		Lcipher += '{ "jsonId" : "' + file_id + '","data" : ' + c + ',"keyId":"' + keyid + '"},'; // List of ciphertexts of keywords
		
		// Compute the address in the dictionary
		var input = KeyW_ciphertext + fileno + "0";
		var addr = hash(input); 
		//console.log("type of address:", typeof addr)
		console.log("hash input to compute address:",input);
		console.log("Address:" + addr);
		
		// Compute value of entry in the dictionary (Map)
		var val = file_id; //Do not encrypt json_id anymore
		console.log("json_id:", val, " - file number:", fileno, " - value of entry in the dictionary:",val);
		Laddress += '{ "address" : "' + addr + '","value" : "' + val + '","keyId":"' + keyid + '"},'; // the dictionary (Map)
		
	}
	
	Lcipher = Lcipher.slice(0,-1);
	Lcipher +="]}"
	console.log("Lcipher:", Lcipher)	
	
	Laddress = Laddress.slice(0,-1);
	Laddress +="]}"
	console.log("Laddress:", Laddress)
	
	console.log("Send patch request from object:",data); //for testing
	// Send ciphertext to CSP 
	patchRequest(sseConfig.base_url_sse_server + "/api/v1/ciphertext/", Lcipher,callback,async_feat=false);
	
	// Send the dictionary to CSP
	patchRequest(sseConfig.base_url_sse_server + "/api/v1/map/", Laddress,callback,async_feat=false);
	
	console.log("complete upload");
	
	return true;
}

/**
 * Decrypt the retrieved ciphertext at SSE Client. The ciphertext is a part of the response from SSE Server after SSE client sends a search request by a keyword.
 * 
 * @param {json} response The response from SSE Server which contains the ciphertext
 * @param {string} Kenc Key or passphrase for key generation. The key will be used for data encryption //needed test
 * @param {number} searchNo The search number of the searched keyword
 * @param {string} searchNoUri The search number URI of the searched keyword
 * @param {string} keyword The searched keyword
 * @param {string} keyid The unique key identification
 * @return {json} JSON.parse(data) The decrypted data in json format. It contains count (number of data objects), and objects (list of data objects)
 */
function retrieveData(response, Kenc, searchNo, searchNoUri,keyword,keyid){
	console.log("response of search:",response)
	var data;
	var msg = "";
	if(response == undefined ){//found 0 results
		found = 0
		data = '{"count":' + found + ',"objects":[]}'
	}
	else if(response.Cfw.length==0){ // found 0 due to wrong key
		msg = response.KeyW;
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
	
	console.log("message from search:",msg);
	if(msg!="error"){ // if found 0 is not due to wrong key
		// Update search number to TA in both cases: found, and not found
		if(searchNo==1){ // If the keyword is new, create searchNo in TA
			var jsonData = '{ "w" : "' + hash(keyword) + '","searchno" : ' + searchNo + ',"keyId":"' + keyid + '"}';
			console.log('Create new entry in searchNo: ',jsonData);
			postRequest(sseConfig.base_url_ta + "/api/v1/searchno/", jsonData, undefined, async_feat = false);	//async_feat=true to searve jest automatic testing				
		}
		else{ // If the keyword is existed, update searchNo in TA
			console.log('Update the entry in searchno');
			putRequest(searchNoUri,'{ "searchno" : ' + searchNo + '}', undefined, async_feat = false); //async_feat=true to searve jest automatic testing	
		}	
	}
	return JSON.parse(data);
}

/**
 * Decrypt a list of ciphertext
 * 
 * @param {list} cipherList The retrieved ciphertext from SSE Server
 * @param {string} Kenc Key or passphrase for key generation. The key will be used for data encryption //needed test
 * @return {list} data The list of decrypted data
 */
// needed test: if this function or retrieveData is redundant
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

/**
 * Search by a keyword
 * 
 * @param {string} keyword The retrieved ciphertext from SSE Server
 * @param {string} sharedKey Key or passphrase for key generation. The key will be shared with SSE TA for verification //needed test
 * @param {string} Kenc Key or passphrase for key generation. The key will be used for encryption //needed test
 * @param {string} keyid Unique key identification. This identification identifies the pair of (sharedKey,Kenc)
 * @return {list} data The list of decrypted data
 */
function findKeyword(keyword, sharedKey, Kenc,keyid){
	console.log("Search keyword function");
	
	var KeyG = computeKeyG(sharedKey);
	var key = hash(Kenc);
	
	var fileNo, fileNoUri;
	
	// Get file number
	[LfileNo, LfileNoUri,listW] = getMultiFileOrSearchNo("fileno",[hash(keyword)],keyid); //"listW" can be different from Lw. It does not contain new keywords (if existed) in Lw
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
	[LsearchNo, LsearchNoUri,tempListWord] = getMultiFileOrSearchNo("searchno",[hash(keyword)],keyid); //"listW" can be different from Lw. It does not contain new keywords (if existed) in Lw
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
	
	var data = '{ "KeyW" : ' + KeyW + ',"fileno" : ' + fileNo + ',"Lu" :[' + arrayAddr + '],"keyId":"' + keyid + '"}';
	console.log("Data sent to CSP:", data);
	
	hashChars = sseConfig.hash_length/4; //number of chars of hash output: 64
	
	console.log("Sent search request:",sseConfig.base_url_sse_server + "/api/v1/search/")
	result = postRequest(sseConfig.base_url_sse_server + "/api/v1/search/", data,function(response){
		return true;
	},async_feat=false);// Send request to CSP
	
	console.log("Results from post request after returned:",result.responseJSON);
	
	data = retrieveData(result.responseJSON,key,searchNo,searchNoUri,keyword,keyid);
	console.log("Results from retrieveData:",data);
	
	return data;
}

/**
 * Search by a json object containing the searched keyword
 * 
 * @param {json} data The json object containing the searched keyword. For instance: {"keyword": searched_keyword}
 * @param {string} sharedKey Key or passphrase for key generation. The key will be shared with SSE TA for verification //needed test
 * @param {string} Kenc Key or passphrase for key generation. The key will be used for encryption //needed test
 * @param {string} keyid Unique key identification. This identification identifies the pair of (sharedKey,Kenc)
 * @return {list} data The list of decrypted data
 */
function search(data, KeyG, Kenc,keyid){
	if(data=={} || KeyG=="" || Kenc=="" || keyid==""){
		console.log("Lack of parameter of search function")
		return {};
	}
	console.log("json object:",data);
	var keyword = data['keyword'];
	if(keyword==undefined){
		console.log("Invalid input file")
		return null;
	}
	console.log("keyword: ",keyword);
	var results = findKeyword(keyword,KeyG,Kenc,keyid);
	return results;
}

/**
 * Compute the list of KeyW values
 * 
 * @param {list} Lhash List of hash values
 * @param {string} KeyG Key or passphrase for key generation. The key will be shared with SSE TA for verification //needed test
 * @param {list} LsearchNo List of search numbers
 * @param {number} offset the amount of increase in No.Search
 * @return {list} LkeyW The list of KeyW values
 */
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

/**
 * Compute the list of address values
 * 
 * @param {list} Lhash List of hash values
 * @param {list} LkeyW The list of KeyW values
 * @param {list} LfileNo The list of file numbers
 * @param {number} offset offset = 0 if computeAddr without changing No.File, offset = 1 if computeAddr with No.File = No.File + 1
 * @return {list} Laddr The list of address values
 */
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

/**
 * Encrypt the list of keywords
 * 
 * @param {list} Lkeyword List of keywords
 * @param {string} Kenc Key or passphrase for key generation. The key will be used for encryption //needed test
 * @return {list} Lcipher The list of ciphertext objects
 */
function encryptList(Lkeyword,Kenc){
	var length = Lkeyword.length;
	
	var Lcipher = []
	for(i=0; i<length;i++){//for each keyword
		c = encrypt(Kenc, Lkeyword[i]);
		Lcipher.push(c);
	}
	
	return Lcipher
}

/**
 * Objects to update file numbers at SSE TA
 * 
 * @param {list} Lhash List of hash values
 * @param {list} LfileNoUri List of file number URI
 * @param {list} LfileNo List of file number
 * @param {number} offset The amount of addition or subtraction from the current fileno
 * @return {list} [del,objects,deleted_objects] del=true if delete file number, del=false otherwise. Objects is the list of updated entries for file numbers. deleted_objects is the list of deleted entries for file numbers.
 */
function updateFileNo(Lhash,LfileNoUri,LfileNo,offset,keyid){
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
		else if(fileno==0){ //&& fileno+offset>0, Addition: if after update, there exists file containing the keyword
			update = true
			console.log('Add new entry in fileNo:',w);
			objects += '{ "w" : "' + w + '","fileno" : ' + new_fileno + ',"keyId":"' + keyid + '"},';
		}
		else { // Update an existed entry in fileno
			update = true
			console.log('Update existed entry in fileNo:',w);
			objects += '{ "w" : "' + w + '","fileno" : ' + new_fileno +  ',"keyId":"' + keyid + '","resource_uri" : "' + LfileNoUri[i] + '"},';	
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

/**
 * Objects to update file numbers at SSE TA
 * 
 * @param {list} Lhash List of hash values
 * @param {list} LfileNoUri List of file number URI
 * @param {list} LfileNo List of file number
 * @param {number} offset The amount of addition or subtraction from the current fileno
 * @return {list} [del,objects,deleted_objects] del=true if delete file number, del=false otherwise. Objects is the list of updated entries for file numbers. deleted_objects is the list of deleted entries for file numbers.
 */
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

/**
 * Update data
 * 
 * @param {json} data The updated data in json format. For example,  { att1:[current_value,new_value], att2:[current_value,new_value] }
 * @param {string} file_id The unique identification of data object
 * @param {string} sharedKey Key or passphrase for key generation. The key will be shared with SSE TA for verification //needed test
 * @param {string} Kenc Key or passphrase for key generation. The key will be used for encryption //needed test
 * @param {string} keyid Unique key identification. This identification identifies the pair of (sharedKey,Kenc)
 * @return {boolean} True if updated successfully, False if otherwise
 */
function updateData(data, file_id, sharedKey, Kenc, keyid, callback){
	if(data=={} || file_id=="" || sharedKey=="" || Kenc=="" || keyid==""){
		console.log("Lack of parameter of updateData function")
		return false;
	}
	
	// Based on {att:current_value}, request for No.Files, No.Search
	console.log("Updating data")
	console.log("key id:",keyid)
	var keys =Object.keys(data)
	console.log("key:",keys)
	var length = keys.length; // number of update fields
	var values = Object.values(data)
	console.log("values:",values)
		
	Lcurrent_value=[];
	Lnew_value=[];
	Lcurrent_hash = [];
	Lnew_hash=[];
	
	var KeyG = computeKeyG(sharedKey);
	var key = hash(Kenc);
	
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
	[Lcurrent_fileNo, Lcurrent_fileNoUri,current_listW] = getMultiFileOrSearchNo("fileno",Lcurrent_hash,keyid);
	
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
	[Lall_found_searchNo,Lall_searchNoUri,all_tempListWord]=getMultiFileOrSearchNo("searchno",Lall_hash,keyid);
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
	[Lnew_found_fileNo, Lnew_fileNoUri,new_listW] = getMultiFileOrSearchNo("fileno",Lnew_hash,keyid); 

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
	Lcurrent_cipher = encryptList(Lcurrent_value,key);
	Lnew_cipher = encryptList(Lnew_value,key);

	var data = '{"file_id":"' + file_id + '","LkeyW" :[' + Lcurrent_keyW + '],"Lfileno" :[' + Lcurrent_fileNo + '],"Ltemp" :[' + Ltemp_addr + '],"Lnew" :[' + Lnew_addr + '],"Lcurrentcipher" :['+ Lcurrent_cipher + '],"Lnewcipher" :['+ Lnew_cipher +'],"keyId":"'+keyid+'"}';
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
		[current_del,current_objects,current_deleted_objects,delete_current_searchno]=updateFileNo(Lcurrent_hash,Lcurrent_fileNoUri,Lcurrent_fileNo,-1,keyid);

		console.log("Increase new No.Files at TA")
		var new_del,new_objects,new_deleted_objects,delete_new_searchno;
		// not yet: check if remove delete_new_searchno is fine or not
		[new_del,new_objects,new_deleted_objects,delete_new_searchno]=updateFileNo(Lnew_hash,Lnew_fileNoUri,Lnew_fileNo,1,keyid);

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

/**
 * Delete data
 * 
 * @param {string} file_id The unique identification of data object
 * @param {string} sharedKey Key or passphrase for key generation. The key will be shared with SSE TA for verification //needed test
 * @param {string} Kenc Key or passphrase for key generation. The key will be used for encryption //needed test
 * @param {string} keyid Unique key identification. This identification identifies the pair of (sharedKey,Kenc)
 * @return {boolean} True if deleted successfully, False if otherwise
 */
function deleteData(file_id, sharedKey, Kenc, keyid, callback){
	if(file_id=="" || sharedKey=="" || Kenc=="" || keyid==""){
		console.log("Lack of parameter of deleteData function")
		return false;
	}
	// Send GET request to CSP to retrieve ciphertext of data belonging to file_id
	var obj = getRequest(sseConfig.base_url_sse_server + "/api/v1/ciphertext/?limit=0&jsonId=" + file_id + "&keyId=" + keyid); //limit=0 allows to get all items
	console.log("response:",obj);
	var length = obj.meta.total_count;
	if(length==0){
		console.log("File_id and/ or key id does not exist");
		return false;
	}
	else{
		console.log("File_id and key id exist");
		var KeyG = computeKeyG(sharedKey);
		console.log("KeyG:",KeyG);
		var key = hash(Kenc);
		
		// Decrypt data
		var pt = decryptData(obj.objects,key);
		
		// Send GET request to TA to retrieve fileno
		// combine multiple hashed keywords into a list, separated by comma
		var Lw=[]; //list of hashed keywords
		var Lcipher=[];
		
		// retrieve data from Map table by file_id
		var objMap = getRequest(sseConfig.base_url_sse_server + "/api/v1/map/?limit=0&value=" + file_id + "&keyId=" + keyid);
		console.log("objects in map table:",objMap);
		for(i=0; i< length; i++){
			w = pt[i];
			Lw.push(hash(w));
			Lcipher.push('"'+obj.objects[i].data+'"');
		}

		console.log("list of hashed keywords:",Lw);
		
		// Retrieve list of file number
		[LfileNo, LfileNoUri,listW] = getMultiFileOrSearchNo("fileno",Lw,keyid);
		console.log("keyword string input:",Lw);
		console.log("List of file numbers: ", LfileNo);
		console.log("List of Url:", LfileNoUri);
		console.log("List of retrieved keywords:",listW);

		var listFileNo;
		if(Lw.length > listW.length)
			listFileNo=createFullList(Lw,listW,LfileNo);
		else
			listFileNo=LfileNo;

		console.log("full list of file no of keywords:",listFileNo);
		// Retrieve search number
		
		[LsearchNo, LsearchNoUri,tempListWord] = getMultiFileOrSearchNo("searchno",Lw,keyid); //"tempListWord" can be empty if all keywords has been never searched

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
		
		var data = '{"file_id":"' + file_id + '","LkeyW" :[' + LkeyW + '],"Lfileno" :[' + LfileNo + '],"Ltemp" :['+ Laddr +'],"Lcipher" :['+ Lcipher +'],"keyId":"'+ keyid + '"}';
		console.log("Data sent to CSP:", data);

		console.log("Sent delete request:",sseConfig.base_url_sse_server + "/api/v1/delete/")
		result = postRequest(sseConfig.base_url_sse_server + "/api/v1/delete/", data,function(response){
			return true;
		},async_feat=false);// Send request to CSP
		
		// Send PATCH request to TA to update/delete entries in fileno table
		var current_del,current_objects,current_deleted_objects;
		[current_del,current_objects,current_deleted_objects]=updateFileNo(Lw,LfileNoUri,LfileNo,-1,keyid);

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

/**
 * Generate key from passphrase using hash function
 * 
 * @param {string} pwdphrase The passphrase which is used for key generation
 * @return {string} Hash value of (pwdphrase + "keyg")
 */
function computeKeyG(pwdphrase){
	return hash(pwdphrase + "keyg");
}

/**
 * Generate key from passphrase, and upload it to SSE TA
 * 
 * @param {string} pwdphrase The passphrase which is used for key generation
 * @param {string} keyid The unique key identification
 * @return {boolean} True if uploading the generated key to SSE TA, false otherwise
 */
function uploadKeyG(pwdphrase,keyid){
	if(pwdphrase=="" || keyid==""){
		console.log("Lack of passphrase or keyid");
		return false;
	}
	console.log("passphrase to compute keyg:",pwdphrase);
	var keyg = computeKeyG(pwdphrase);
	var jsonData = '{ "key" : "' + keyg + '","keyId":"' + keyid + '"}';
	console.log("uploaded KeyG:",keyg)
	postRequest(sseConfig.base_url_ta + "/api/v1/key/", jsonData, undefined, async_feat = false);
	return true;
}

/**
 * Encrypt blob data of small size (<=10MB)
 * 
 * @param {blob} blobData The blob data
 * @param {string} ftype File type
 * @param {string} Kenc Key or passphrase for key generation. The key will be used for encryption //needed test
 * @return {promise} A promise to create blob of encrypted data
 */
function encryptBlob(blobData,ftype, Kenc){
	return function(resolve) {
		var reader = new FileReader()

		reader.onload = function(e){
			var imageData = new Uint8Array(e.target.result);
			console.log("Blob content:",imageData);    	    
			var imageString = sjcl.codec.base64.fromBits(imageData); // convert byte array to base64 string
			console.log("image plaintext in string:",imageString);

			var imagecipher = encrypt(Kenc,imageString); //encrypt

			var objJsonStr = JSON.stringify(imagecipher); // json -> string
			console.log("cipher image in string:",objJsonStr);
			var objJsonB64 = btoa(objJsonStr); // string -> base64
			console.log("cipher image in base64:",objJsonB64);
			var temp=sjcl.codec.base64.toBits(objJsonB64); // base64 -> bits
			console.log("number of bits:",temp.length);
			console.log("bit array:",sjcl.codec.base64.toBits(objJsonB64));
			
			var cipherByte = new Uint8Array(fromBitArrayCodec(sjcl.codec.base64.toBits(objJsonB64)));
			console.log("cipher image in byte:",cipherByte);
			console.log("number of bytes:",cipherByte.length);
			var cipherBlob = new Blob([cipherByte], { type: ftype });
			resolve(cipherBlob);

		};
		reader.readAsArrayBuffer(blobData);	
	}
 }

/**
 * Encrypt blob data progressively, and upload them to MinIO server
 * It can support large files (~800MB)
 * Approach: File -> divide into chunks -> encrypt each chunk -> upload -> (loop) -> until finish
 * 
 * @param {blob} blobData The blob data
 * @param {string} fname File name
 * @param {string} ftype File type
 * @param {string} Kenc Key or passphrase for key generation. The key will be used for encryption //needed test
 * @param {string} keyId The unique key identification
 * @return {promise} A promise to upload ciphertext chunks to MinIO server
 */
function encryptProgressBlob(blobData,fname,ftype, Kenc, keyId){
	console.log("Progress Encrypt Blob")
	console.log("blob content:",blobData)
	return function(resolve) {
		var reader = new FileReader()
		reader.onload = function(e){
			var imageData = new Uint8Array(e.target.result);
			console.log("Blob content:",imageData);    	    
			
			var iv = sjcl.hash.sha1.hash(sseConfig.iv).slice(0,4); // IV should be an array of 4 words. Get 4 words to create iv

			var key = sjcl.hash.sha256.hash(Kenc); //key is an array of 4,6 or 8 words
			var aes = new sjcl.cipher.aes(key);
			//adata = "";
			var enc = sjcl.mode.ocb2progressive.createEncryptor(aes, iv);

		    var result = [];
		    var sliceSizeRange = sseConfig.chunk_size;// size of 1 slice/ chunk for encryption (in uint8 items)
		    var slice = [0, sseConfig.chunk_size];//data will be sliced/ chunked/ read between slice[0] and slice[1]
		    var count = 0;
		    console.log("length of data:",imageData.length);
		    
		    var cipherpart, outputname;
		    var idx=0;
		    var tb=[];
		    
		    while (slice[0] < imageData.length) {
		    	result = result.concat(enc.process(sjcl.codec.bytes.toBits(imageData.slice(slice[0], slice[1]))));
		        slice[0] = slice[1];
		        slice[1] = slice[0] + sliceSizeRange;
		        if(slice[1]>imageData.length)
		        	slice[1] = imageData.length;
		        
		        count = count +1 ;		        
		        
		        if((count % sseConfig.no_chunks_per_upload)==0){ //upload each part of #fragment chunks/ slices.
		        	console.log("upload part:",count);
		        	console.log("ciphertext type:",typeof result);

		        	tb[idx]=result;
		        	console.log("tb[idx]:",tb[idx])
		        	idx = idx+1;        	
		        	
					cipherpart = new Blob([result], { type: ftype });//upload as 1 whole part
		        	result = [];
		        	outputname= fname + "_part" + idx + keyId;
		        	console.log("blob cipher:",cipherpart);
		        	uploadMinio(cipherpart,outputname);
		        }
		    }
		    result = result.concat(enc.finalize());
		    console.log("Last part ciphertext:",result)
		    tb[idx]=result;
		    console.log("tb[idx]:",tb[idx])
	    	idx = idx+1;
		    
		    cipherpart = new Blob([result], { type: ftype });
        	outputname= fname + "_part" + idx  + keyId;
        	uploadMinio(cipherpart,outputname);
        	
        	outputname= fname + "_meta" + keyId;
        	cipherpart = new Blob([idx], { type: ftype });
        	uploadMinio(cipherpart,outputname);
        	
        	/*
        	//decryption - for testing only
        	
		    try {
		    	console.log("Decrypting")
		        var dec = sjcl.mode.ocb2progressive.createDecryptor(aes, iv);
		        var dresult = [];
		        console.log("idx",idx);
		       
		        var i;
		        var imageByte, imageDecryptBlob;
		        
		        for (i = 0; i < idx; i++) {
		        	console.log("decrypting block:",i)
		        	console.log("type of ciphertext:",typeof tb[i]);
		        	console.log("ciphertext:",tb[i]);
		        	//dresult = dresult.concat(fromBitArrayCodec(dec.process(tb[i])));
		        	
		        	dresult = fromBitArrayCodec(dec.process(tb[i])); // testing only
		        	console.log("plaintext:",dresult);
		        	
		        	//for testing
		        	imageByte = new Uint8Array(dresult); // create byte array from base64 string
					console.log("plaintext in bytes:",imageByte);	
					imageDecryptBlob = new Blob([imageByte], { type: ftype });
					uploadMinio(imageDecryptBlob,"plaintext" + idx);
		        }
		        dresult = dresult.concat(dec.finalize());
		        console.log("plaintext:",dresult)
		        imageByte = new Uint8Array(dresult); // create byte array from base64 string
				console.log("plaintext in bytes:",imageByte);
		
				imageDecryptBlob = new Blob([imageByte], { type: ftype });//{ type: ftype });
				uploadMinio(imageDecryptBlob,"plaintext");
				
				console.log("complete decrypting and sending to minio");
		    } catch (e) {
		        console.log("Error:" + e);
		    }
		    */
			resolve(cipherpart);

		};
		reader.readAsArrayBuffer(blobData);	
	}
}

/**
 * Download file from MinIO server using a pre-signed URL
 * 
 * @param {url} presignedUrl The presigned URL which is generated by MinIO Server
 * @param {string} fname File name
 * @param {callback} callback Callback function
 * @return {} True
 */
function downloadWithPresignUrl(presignedUrl,fname,callback){
	$.ajax({
		  url: presignedUrl, // the presigned URL
		  type: 'GET',
          xhrFields:{
              responseType: 'blob' //download as blob data
          },
		  success: function(data, status) {
			  callback(data,fname) //decrypt data
			  return true; 
		  },
		  error: function(erro){
				console.error("Download from Minio Error");
		  }
	})
}

/**
 * Retrieve a presigned URL (generated by MinIO server) which can be used for getting data from MinIO server
 *
 * @param {string} fname File name
 * @return {url} A presigned URL which can be used for retrieving data from MinIO server
 */
function getPresignUrl(fname){
	url = sseConfig.base_url_sse_server + "/api/v1/presign/"+ fname + "/";
	console.log("Rest API to get presign url:",url)
	ret = ""
	$.ajax({
		  url: url, // the rest api URL
		  type: 'GET',
		  async: false,
		  success: function(response, status) {
			  console.log("presignUrl",response.url)
			  ret = response.url
		  },
		  error: function(erro){
				console.error("Download from Minio Error");
		  }
	})
	return ret;
}

/**
 * Retrieve a presigned URL (generated by MinIO server) which can be used for uploading/ updating data to MinIO server
 *
 * @param {string} fname File name
 * @return {url} A presigned URL which can be used for uploading/ updating data to MinIO server
 */
function putPresignUrl(fname){
	url = sseConfig.base_url_sse_server + "/api/v1/presign/";
	console.log("Rest API to put presign url:",url)
	console.log("filename:",fname)
	ret = ""
	var data = {
		"fname" : fname
	};
	$.ajax({
		  url: url, // the rest api URL
		  type: 'POST',
          contentType: 'application/json',
		  data: JSON.stringify(data),
		  async: false,
		  success: function(response, status) {
			  console.log("presignUrl",response.url)
			  ret = response.url
		  },
		  error: function(erro){
				console.error("Put presign url from Minio Error");
				console.error(erro);
		  }
	})
	return ret;
}

/**
 * Upload file to MinIO server using a presigned URL
 * 
 * @param {blob} blob The blob data
 * @param {string} fname File name
 * @param {callback} callback Callback function
 * @return {} Blob data is uploaded to MinIO server
 */
//Upload file to Minio
//Input: - fname: filename, - blob: data to upload
function uploadMinio(blob,fname,callback=undefined){
	var presigned_url = putPresignUrl(fname) // request for a presigned url
    
	$.ajax({
		url: presigned_url,
		type: 'PUT',
		processData:false,
		data: blob,
		async: false,
		success: function(data) {
			if(callback!=undefined){
				callback(true);
			}
		},
		error: function(erro){
			console.error("Put Request Error");
		}
	})
}

/**
 * Encrypt blob data (<=10MB) and upload to MinIO along with its searchable encrypted metadata (json format)
 * It can only support small data (<=10MB)
 * 
 * @param {blob} blob Blob data
 * @param {string} fname File name
 * @param {json} jsonObj Metatdata in the format of json object. The uploaded blob data will be searchable by any keyword in its metadata
 * @param {string} file_id The unique key identification
 * @param {string} KeyG Key or passphrase for key generation. The key is used to encrypt data // needed test
 * @param {string} Kenc Key or passphrase for key generation. The key is shared with SSE TA for verification // needed test
 * @param {callback} callback Callback function
 * @return {} The encrypted blob data is sent to MinIO, and its encrypted metadata is sent to SSE Server
 */
// test to remove callback function
function encryptUploadSearchableBlob(blob,fname,jsonObj,file_id, KeyG, Kenc,keyId,callback=undefined){
	//append filename to metadata
	jsonObj.filename = fname;
	console.log("metadata after appending filename:{}",jsonObj);
	encryptUploadBlob(blob,fname,Kenc,keyId);
	uploadData(jsonObj,file_id,KeyG,Kenc,keyId);
}


/**
 * Encrypt large blob data and upload to MinIO along with its searchable encrypted metadata (json format)
 * It can support large data (~800MB)
 * 
 * @param {blob} blob Blob data
 * @param {string} fname File name
 * @param {json} jsonObj Metatdata in the format of json object. The uploaded blob data will be searchable by any keyword in its metadata
 * @param {string} file_id The unique key identification
 * @param {string} KeyG Key or passphrase for key generation. The key is used to encrypt data // needed test
 * @param {string} Kenc Key or passphrase for key generation. The key is shared with SSE TA for verification // needed test
 * @param {callback} callback Callback function
 * @return {} The encrypted blob data is sent to MinIO, and its encrypted metadata is sent to SSE Server
 */
function encryptProgressUploadSearchableBlob(blob,fname,jsonObj,file_id, KeyG, Kenc,keyId, callback=undefined){
	//append filename to metadata
	jsonObj.filename = fname;
	console.log("metadata after appending filename:{}",jsonObj);
	encryptProgressUploadBlob(blob,fname,Kenc,keyId);
	uploadData(jsonObj,file_id,KeyG,Kenc,keyId);
}

/**
 * Encrypt blob data and upload to MinIO
 * It can support only small data (<=10MB)
 * 
 * @param {blob} blob Blob data
 * @param {string} fname File name
 * @param {string} KeyG Key or passphrase for key generation. The key is used to encrypt data // needed test
 * @param {string} Kenc Key or passphrase for key generation. The key is shared with SSE TA for verification // needed test
 * @param {callback} callback Callback function
 * @return {promise} promise A promise to upload encrypted blob data
 */
function encryptUploadBlob(blob,fname,Kenc,keyId,callback=undefined){
    var ftype = blob.type;
    var outputname = fname + keyId;
    var promise = new Promise(encryptBlob(blob,ftype,Kenc));

    // Wait for promise to be resolved, or log error.
    promise.then(function(cipherBlob) {
    	console.log("Completed encrypting blob. Now send data to server.")
    	console.log(cipherBlob);
    	uploadMinio(cipherBlob,outputname,callback);
    	//return true;//for jest
    }).catch(function(err) {
    	console.log('Error: ',err);
    });
    return promise;
}


/**
 * Encrypt large blob data progressively, and upload chunks of ciphertext to MinIO
 * It can support large data (~800MB)
 * 
 * @param {blob} blob Blob data
 * @param {string} fname File name
 * @param {string} KeyG Key or passphrase for key generation. The key is used to encrypt data // needed test
 * @param {string} Kenc Key or passphrase for key generation. The key is shared with SSE TA for verification // needed test
 * @param {callback} callback Callback function
 * @return {promise} promise A promise to upload the ciphertext chunks to MinIO server
 */
//Encrypt large blob data and upload to Minio
function encryptProgressUploadBlob(blob,fname,Kenc,keyId,callback=undefined){
    var ftype = blob.type;
    console.log("blob type:",ftype);

    var promise = new Promise(encryptProgressBlob(blob,fname,ftype,Kenc,keyId));

    // Wait for promise to be resolved, or log error.
    promise.then(function(cipherBlob) {
    	console.log("Completed encrypting blob. Now send data to server.")
    }).catch(function(err) {
    	console.log('Error: ',err);
    });
    return promise;
}


/**
 * Download file from Minio, decrypt and save it to local host (blob file <=10MB)
 * It can support only small data (<=10MB)
 * 
 * @param {string} fname File name
 * @param {string} KeyG Key or passphrase for key generation. The key is used to encrypt data // needed test
 * @param {string} Kenc Key or passphrase for key generation. The key is shared with SSE TA for verification // needed test
 * @param {callback} callback Callback function
 * @return {} Decrypted data is save as a file
 */
function downloadDecryptBlob(fname,Kenc,keyId,callback=undefined){
	console.log("Download blob")
	var presigned_url = getPresignUrl(fname+keyId) // request for a presigned url 
	$.ajax({
		  url: presigned_url, // the presigned URL
		  type: 'GET',
	      xhrFields:{
	            responseType: 'blob' //download as blob data
	      },
		  success: function(data, status) {
			  console.log("Decrypt and save blob")
			  decryptSaveBlob(data,fname,Kenc,callback) //decrypt data
		  },
		  error: function(erro){
			  console.error("Download from Minio Error");
			  console.error(erro);
		  }
	})
}

/**
 * Decrypt a ciphertext downloaded from MinIO server, and save as file.
 * This function can support only small files (<=10MB)
 * 
 * @param {blob} blob Blob 
 * @param {string} fname File name
 * @param {string} Kenc Key or passphrase for key generation. The key is used for encrypting data. //needed test
 * @param {callback} callback Callback function
 * @return {promise} Promise to save decrypted data as a file
 */
function decryptSaveBlob(blob,fname,Kenc,callback=undefined){
	 var outputname = fname;//fname.split(".")[0];// + "_decrypted";
	 console.log("Filename to be saved: " +  outputname);
	 var ftype = blob.type; //identify filetype from blob
	 
	 var promise = new Promise(decryptBlob(blob,ftype,Kenc));
	 //var promise = decryptBlob(blob,ftype,Kenc);
	 
	 promise.then((plainBlob) => {
		 console.log("Save file to disk");
		 saveBlob(plainBlob,outputname);
		 if(callback!=undefined){
			callback(true); // for jest
		}
	 })
	 return promise;
}

/**
 * Decrypt a ciphertext downloaed from MinIO server
 * This function can support only small files (<10MB)
 * 
 * @param {blob} blobCipher Ciphertext downloaded from MinIO server
 * @param {string} ftype File type 
 * @param {string} Kenc Key or passphrase for key generation. The key is used for encrypting data. //needed test
 * @return {promise} Promise to create the decrypted blob
 */
function decryptBlob(blobCipher,ftype,Kenc){
	return function(resolve) {
		var reader = new FileReader();
		console.log("Decrypt blob")
		reader.onload = function(e){
			var imagecipher = new Uint8Array(e.target.result);
			console.log("input array:",imagecipher);
	
			var bitarray = toBitArrayCodec(imagecipher);
			//var bitarray = sjcl.codec.bytes.toBit(imagecipher);//needed test
			console.log("bit array:",bitarray);
	
			var imageBase = sjcl.codec.base64.fromBits(bitarray); // byte array->base64
			console.log("image ciphertext in base64:",imageBase);
			var imageString = atob(imageBase); //base64 -> string
			console.log("image ciphertext in string:",imageString);
			var imageJson = JSON.parse(imageString);//string->json
			console.log("ciphertext in json:",imageJson);
	
			var imagept = decrypt(Kenc,imageJson);
			console.log("decrypt image in string:",imagept);
	
			var imageByte = new Uint8Array(sjcl.codec.base64.toBits(imagept)); // create byte array from base64 string
			console.log("plaintext in bytes:",imageByte);
	
			var imageDecryptBlob = new Blob([imageByte], { type: ftype });
			resolve(imageDecryptBlob);
		};	
		reader.readAsArrayBuffer(blobCipher);
	}
}

/**
 * Download chunks of ciphertext from MinIO server, decrypt them and save as multiple files. Create a script to merge multiple files into one.
 * This function can support large files (~800MB)
 * 
 * @param {string} fname File name
 * @param {string} Kenc Key or passphrase for key generation. The key is used for encrypting data. //needed test
 * @param {string} keyId Unique key identification
 * @param {callback} callback Callback function
 * @return {} Download multiple of plaintext chunk files, and a script file (concat_script.txt) to merge them into one plaintext file
 */
function downloadProgressDecryptBlob(fname,Kenc,keyId,callback=undefined){
    console.log("Download blob")
    try {
    	var metafile = fname + "_meta" + keyId;
    	var presigned_url = getPresignUrl(metafile);  
    	var fragments = [];
        $.ajax({
        	url: presigned_url,
            type: 'GET',
            async: false,
            success: function(blob, status) { 
            	//create a list which contains names of ciphertext chunks
                console.log("meta data:",blob);
                var i;
                for (i = 1; i <= blob; i++) {
                	fragments.push(fname + "_part"+i + keyId);
                }
                console.log("file names:",fragments);
                
                //create a concatenation script for users to merge multiple chunks of plaintext into a complete plaintext
                var script_data="cat $(for((i=1;i<="+blob+";i++)); do echo -n \""+fname +"${i} \"; done) > "+fname;
                console.log("script:",script_data);
               	var outputname= fname + "_script" + keyId;
                var blob = new Blob([script_data]);
                saveBlob(blob,"concat_script");

       		},
            error: function(erro){
                 console.log("Download from Minio Error");
                 console.log(erro);
             }
         })	            
        var iv = sjcl.hash.sha1.hash(sseConfig.iv).slice(0,4); // IV should be an array of 4 words. Get 4 words to create iv
		var key = sjcl.hash.sha256.hash(Kenc); //key is an array of 4,6 or 8 words

        var aes = new sjcl.cipher.aes(key);
        var dec = sjcl.mode.ocb2progressive.createDecryptor(aes, iv);
        
        for (var i=0; i<fragments.length; i++) {
            presigned_url = getPresignUrl(fragments[i]);          
            $.ajax({
            	url: presigned_url,
                type: 'GET',
                async: false,
                success: function(blob, status) {
                    var ftype = blob.type;
                   	var imageJson = JSON.parse("[" +blob+"]");//string->json
           			console.log("ciphertext in json - imageJson:",imageJson);
            			
           			var dresult = sjcl.codec.bytes.fromBits(dec.process(imageJson));            			
         		    if(i==fragments.length-1){
   	     		    	dresult = dresult.concat(dec.finalize());
   	     		    }
    	     		    
           			var imageByte = new Uint8Array(dresult); // create byte array from base64 string
     				console.log("plaintext in bytes - imageByte:",imageByte);
     				var imageDecryptBlob = new Blob([imageByte], { type: ftype });
     				var j = i+1;
           			saveBlob(imageDecryptBlob,fname+j);
           		},
                error: function(erro){
                     console.log("Download from Minio Error");
                     console.log(erro);
                 }
                })	
        }
    } catch (e) {
        console.log("Error:" + e);
    }    
}

/**
 * Convert from an array of bytes to a bitArray. This function is referenced from internet.
 * 
 * @param {array} bytes Array of bytes
 * @return {array} out Bit array //needed test
 */
function toBitArrayCodec(bytes) {
    var out = [], i, tmp=0;
    for (i=0; i<bytes.length; i++) {
        tmp = tmp << 8 | bytes[i];
        if ((i&3) === 3) {
            out.push(tmp);
            tmp = 0;
        }
    }
    if (i&3) {
        out.push(sjcl.bitArray.partial(8*(i&3), tmp));
    }
    return out;
}

/**
 * Convert from a bitArray to an array of bytes. This function is referenced from internet.
 * 
 * @param {array} arr Bit array //needed test
 * @return {array} out Array of bytes
 */
function fromBitArrayCodec(arr) {
    var out = [], bl = sjcl.bitArray.bitLength(arr), i, tmp;
    for (i=0; i<bl/8; i++) {
        if ((i&3) === 0) {
            tmp = arr[i/4];
        }
        out.push(tmp >>> 24);
        tmp <<= 8;
    }
    return out;
}

/**
 * Save blob to file. This function is referenced from internet.
 * 
 * @param {blob} blob The blob data
 * @param {string} fileName The file name
 * @return {} The blob is saved as a file in Download
 */
function saveBlob(blob, fileName) {
	console.log("save file")
	 var a = document.createElement("a");
	 document.body.appendChild(a);
	 a.style = "display: none";
	 var url = window.URL.createObjectURL(blob);
	 a.href = url;
	 a.download = fileName;
	 a.click();
	 console.log("click")
	 window.URL.revokeObjectURL(url);
	 document.body.removeChild(a);
	 blob=null;
}; 

/**
 * Generate a key from a passphrase with Pbkdf2 function, 
 * then encrypt the key with RSA PKCSv1.5 using the public key retrieved from the TA, 
 * and upload it to SSE TA
 *
 * @param {string} pwdphrase The passphrase to generate a key.
 * @param {string} keyid The unique key identification
 */
async function uploadKeyGsgx(pwdphrase,keyid){
	if(pwdphrase=="" || keyid==""){
		console.log("Lack of passphrase or keyid");
		return false;
	}
	//console.log("passphrase to compute keyg:",pwdphrase);
	var keyg = computeKeyG_Pbkdf2(pwdphrase,sseConfig.salt_sgx,sseConfig.iter_sgx,sseConfig.ks_sgx); //generate key from a passphrase

	console.log("keyg:",keyg);
	console.log("URL TA:",sseConfig.base_url_ta)
	
	var ret = getRequest(sseConfig.base_url_ta + "/api/v1/pubkey/pk/"); //get public key from SSE TA
	var pk=ret['pubkey'].replace(/(\r\n|\n|\r)/gm, ""); //remove all line breaks inside PEM format of the key
	console.log("public key from TA SGX:",pk);
	
	var encryptor = new JSEncrypt();
	encryptor.setPublicKey(pk);
	var ct = encryptor.encrypt(keyg); // encrypt with RSA PKCSv1.5
	console.log("ciphertext:",ct);
	
	var jsonData = '{ "pubkey" : "' + ct + '","keyId":"' + keyid + '"}';
	console.log("uploaded data:",jsonData)
	postRequest(sseConfig.base_url_ta + "/api/v1/pubkey/", jsonData, undefined, async_feat = false);
	
	return true;
}

// test: 
function sendkeyW(keyword, pwdphrase, keyid){
	console.log("Search keyword function");
	
	
	var KeyW = encrypt_sgx(pwdphrase,keyword);
	
	var data = '{ "KeyW" : "' + KeyW + '","keyId":"' + keyid + '"}';
	console.log("Data sent to TA:", data);
	
	result = postRequest(sseConfig.base_url_ta + "/api/v1/search/", data);
	
	console.log("Response from TA:",result);
	
	return data;
}

/**
 * Generate a key from a passphrase with Pbkdf2 function, 
 *
 * @param {string} pwdphrase The passphrase to generate a key.
 * @param {base64 or hexa string} salt The salt value to generate a key
 * @param {number} iter The number of iteration in the Pbkdf2 function
 * @param {number} keysize The size of the generated key. It could be 128, 192, or 256.
 * @return {hexa string} key The generated key
 */
function computeKeyG_Pbkdf2(pwdphrase,salt,iter,keysize) {
  var key, options={};
  
  options.iter = iter;
  options.salt = sjcl.codec.base64.toBits(salt);

  options = sjcl.misc.cachedPbkdf2(pwdphrase, options);
  var key = options.key.slice(0, keysize/32); // @return: list of item which is 4 bytes
  var key_hexa = sjcl.codec.hex.fromBits(key);  // convert to hex string
  console.log("key as hex string:",key_hexa)
  return key_hexa; 
}

/**
 * Encrypt with AES-CCM. The encryption needs to be compatible with decryption at SSE TA.
 * 128 bits (defined by sseConfig.ks_sgx) if sgx is enabled at SSE TA (due to the restriction of mbedtls in SGX, we only use 128 bits for encryption) 
 * 256 bits otherwise (defined by sseConfig.ks)
 * 
 * @param {string} key The AES key (base64) or pwdphrase (string).
 * @param {string} input Plaintext
 * @param {boolean} sgx_enable True if encryption needs to be compatible with decryption inside SGX at TA, false if it does not need to be compatible
 * @return {string} ct Ciphertext
 */
function encrypt_sgx(key, input, sgx_enable=true){
	var options = {};
	if(sgx_enable) // encrypt with AES-CCM 128 bit
		options = {mode:sseConfig.mode_sgx,iter:sseConfig.iter_sgx,
			ks:sseConfig.ks_sgx,ts:sseConfig.ts_sgx,v:1,
			cipher:sseConfig.cipher_sgx,
			adata: sseConfig.adata_sgx,salt:sseConfig.salt_sgx, iv:sseConfig.iv_sgx}; //salt, iv are base64 string
	else // encrypt with AES-CCM 256 bit
		options = {mode:sseConfig.mode_sgx,iter:sseConfig.iter,
			ks:sseConfig.ks,ts:sseConfig.ts,v:1,
			cipher:sseConfig.cipher,
			adata:sseConfig.adata,salt:sseConfig.salt, iv:sseConfig.iv}; 
	var res = sjcl.encrypt(key, input, options);
	var ct = JSON.parse(res).ct;
	return ct;
}