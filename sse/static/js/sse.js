/////////////////////// CONFIGURATION FOR AUTOMATIC TESTS WITH JEST- Start ///////////////////////
//const $ = require('./jquery-3.6.0.min.js') // for jest automatic testing
//const sjcl = require('./sjcl.js') // for jest automatic testing
//module.exports = [uploadData,search,updateData,deleteData,uploadKeyG,computeKey]; // for jest automatic testing
/////////////////////// CONFIGURATION FOR AUTOMATIC TESTS WITH JEST- End ///////////////////////


/////////////////////// CONFIGURATION FOR BENCHMARKING TESTS WITH JEST- Start ///////////////////////
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

//{salt,iv,iter,ks,ts,mode,adata,adata_len} are parameters for encrypting data at SSE client
//{salt_ta,iv_ta,iter_ta,ks_ta,ts_ta,mode_ta,adata_ta,adata_len_ta} are parameters to be shared between SSE client and SSE TA.

var sseConfig={
        'base_url_ta' : 'ta_url', //{url} URL of SSE TA. Example: http://127.0.0.1:8000
        'base_url_sse_server' : 'sse_url',//{url} URL of SSE Server
        'salt' : 'salt_value', //{base64, 8 bytes} Salt value which is used for key generation from a passphrase, if needed
        'iv' : 'iv_value', //{base64, 8 bytes} Initial vector value which is used for encryption  
        'iter' : iter_value, //{number} Number of iteration for generating key from passphrase, if needed. Example: 1000,10000
        'ks' : ks_value, // {number} key size. Example: 128, 256
        'ts' : ts_value, // {number} tag size. Example: 64
        'mode' : 'ccm', // {string} Encryption mode. Example: ccm
        'adata':'', // {string, ''} This is not supported to be configurable yet
        'adata_len' : 0, //{number, 0} This is not supported to be configurable yet
        'hash_length' : hash_length_value, // {number} length of hash value
        'chunk_size' : chunk_size_value,// {number} Size of 1 slice/ chunk for encryption (in uint8 items). The value 32768 (=1024^32) is selected by running experiments to avoid the memory crash. This can be selected differently, but needs to run experiments to predict any memory crash in the browser.  
        'no_chunks_per_upload' : no_chunks_per_upload_value, // {number} Number of chunks to be packed in 1 upload. The value 30 is selected by running experiments to avoid the memory crash. This can be selected differently, but needs to run experiments to predict any memory crash in the browser.  
        'salt_ta' : 'salt_ta_value', // {base64, 8 bytes} salt value which is used for key generation from a passphrase, if needed
        'iv_ta' : 'iv_ta_value', // {base64, 8 bytes} Initial vector value which is used for encryption
        'iter_ta' : iter_ta_value, //{number} Number of iteration for generating key from passphrase, if needed. Example: 1000,10000
        'ks_ta' : ks_ta_value, //{number} keysize. If SGX is enabled at TA, it must be set to 128 bits to be compatible with AES encryption in SGX enclave
        'ts_ta' : ts_ta_value, // {number, 64} tag size. It is not supported to be configurable yet.
        'mode_ta' : 'ccm', // {string} Encryption mode. Example: ccm
        'adata_ta':'', // {string, ''} This is not supported to be configurable yet
        'adata_len_ta' : 0, //{number, 0} This is not supported to be configurable yet
        'sgx_enable': sgx_enable_value, // {boolean} True if SGX is enabled at SSE TA, false otherwise
        'base_url_cp_abe' : 'cp_abe_url', //{url} URL of CP-ABE server
        'debug' : debug_value // {boolean} true if debug, false otherwise
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
 * @param {string} header The request header
 * @return {response} result The response
 */
function postRequest(api_url, jsonObj, callback=undefined, async_feat=true, headers={}) {
	console.log("data:", jsonObj);
	result = $.ajax({
		url: api_url,
		type: 'POST',
		contentType: 'application/json',
		data: jsonObj,
		async: async_feat,
		headers: headers,
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
 * Enable/ disable logging by setting DEBUG value to true/false
 * Reference: https://stackoverflow.com/questions/1215392/how-to-quickly-and-conveniently-disable-all-console-log-statements-in-my-code
 */
DEBUG = sseConfig.debug; // set to false to disable debugging
old_console_log = console.log;
console.log = function() {
    if ( DEBUG ) {
        old_console_log.apply(this, arguments);
    }
}

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
 * @param {hex string or string} key Key (hex string) or passphrase (arbitrary string) for key generation 
 * If it is a passphrase, a key will be generated from the passphrase.
 * Example: "358610db4b113a5763111164e391b5ab2696577f44407f92dfb55581b76b34ce" as a key (number of hex characters = keysize/4), or "123" as a passphrase
 * @param {string} input Plaintext
 * @return {object} res Ciphertext object. For example:{"iv":"IjJ65qTj+uwKJnrTfRW2hw==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"+lSbfNMnwP8=","ct":"0ARVIuwmi1IrtGT3k1NHF6w0rXfD0w=="}
 */
function encrypt(key, input, ista=false){
	var options;
	if(ista==false) // if encryption happens only at SSE client
		options = {mode:sseConfig.mode,iter:sseConfig.iter,ks:sseConfig.ks,ts:sseConfig.ts,v:1,cipher:"aes",adata:sseConfig.adata,salt:sseConfig.salt,iv:sseConfig.iv}; 
	else // if encryption happens at SSE client, decryption happens at TA (for verification)
		if(sseConfig.sgx_enable==true && sseConfig.ks_ta!=128 ){
			console.log("SSE TA with SGX enabled can only support 128 bit key. Please correct the value of sseConfig.ks_ta.")
			return {}
		}
		options = {mode:sseConfig.mode,iter:sseConfig.iter_ta,ks:sseConfig.ks_ta,ts:sseConfig.ts_ta,v:1,cipher:"aes",adata:sseConfig.adata_ta,salt:sseConfig.salt_ta,iv:sseConfig.iv_ta}; 
	var res = sjcl.encrypt(key, input, options);
	return res; // return a ciphertext object
}

/**
 * Decrypt data
 * 
 * @param {hex string or string} key Key (hex string) or passphrase (arbitrary string) for key generation  
 * If it is a passphrase, a key will be generated from the passphrase.
 * Example: "358610db4b113a5763111164e391b5ab2696577f44407f92dfb55581b76b34ce" as a key (number of hex characters = keysize/4), or "123" as a passphrase
 * @param {object} cipherObj Ciphertext object
 * @return {string} res Decrypted data (plaintext)
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
 * @param {hex string or string} sharedKey Key (hex string) or passphrase (arbitrary string) for key generation. 
 * If it is a passphrase, a key will be generated from the passphrase.
 * The key will be shared with SSE TA for verification
 * Example: "358610db4b113a5763111164e391b5ab2696577f44407f92dfb55581b76b34ce" as a key (number of hex characters = keysize/4), or "123" as a passphrase
 * @param {hex string or string} Kenc Key (hex string) or passphrase (arbitrary string) for key generation. 
 * If it is a passphrase, a key will be generated from the passphrase.
 * The key will be used for data encryption
 * @param {string} keyid The unique key identification
 * @param {boolean} iskey false if sharedKey, Kenc are passphrases, true if they are keys
 * @param {callback} callback Callback function. This is used for automatic test with Jest
 * @return {boolean} false/true False if error, True if successful
 */
function uploadData(data, file_id, sharedKey, Kenc, keyid, iskey=false, callback=undefined){
	if(data=={} || file_id=="" || sharedKey=="" || Kenc=="" || keyid==""){
		console.log("Lack of parameter of uploadData function")
		return false;
	}
	
	if(sharedKey == Kenc){
		console.log("The two provided passphrases/ keys should be different to avoid SSE TA to learn the encryption key!")
		return false;
	}
	// verify if file_id existed
	var ret = getRequest(sseConfig.base_url_sse_server + "/api/v1/ciphertext/?limit=1&jsonId="+file_id+"&keyId="+keyid);
	if (ret.meta['total_count']>0){
		console.log("Existed file id")
		return false;
	}

	var KeyG, key;
	if(iskey == false) {// sharedKey is a passphrase. A key is generated from the passphrase
		KeyG = sjcl.codec.hex.toBits(computeKey(sharedKey,true)); // hex string -> array
		console.log("KeyG (in array format):",KeyG);
		key = sjcl.codec.hex.toBits(computeKey(Kenc)); // hex string -> array
	} else {
		KeyG = sjcl.codec.hex.toBits(sharedKey); // sharedKey is a key
		console.log("KeyG (in array format):",KeyG);
		key = sjcl.codec.hex.toBits(Kenc);
	}
	
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
		KeyW = encrypt(KeyG,hw + searchno,true);	
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
 * @param {string} Kenc Key (hex string) or passphrase (arbitrary string) for key generation. 
 * If it is a passphrase, a key will be generated from the passphrase
 * The key is used for data encryption
 * Example: "358610db4b113a5763111164e391b5ab2696577f44407f92dfb55581b76b34ce" as a key (number of hex characters = keysize/4), or "123" as a passphrase
 * @param {number} searchNo The search number of the searched keyword
 * @param {string} searchNoUri The search number URI of the searched keyword
 * @param {string} keyword The searched keyword
 * @param {string} keyid The unique key identification
 * @return {json} JSON.parse(data) The decrypted data in json format. It contains count (number of data objects), and objects (list of data objects)
 * Example: { count: 1, objects: [ { firstname: 'David', lastname: 'White' } ] }
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
 * @return {list} data The list of ciphertext object
 * Example:  [
        {
          data: "{'iv': 'YWJjZGVmZw==', 'v': 1, 'iter': 10000, 'ks': 256, 'ts': 64, 'mode': 'ccm', 'adata': '', 'cipher': 'aes', 'salt': 'YWJjMTIzIT8=', 'ct': '+GY52jIR88d1jeo8wtN8TEojTeH/ikY='}",
          id: 6,
          jsonId: '2',
          keyId: '1',
          resource_uri: '/api/v1/ciphertext/6/'
        },
        {
          data: "{'iv': 'YWJjZGVmZw==', 'v': 1, 'iter': 10000, 'ks': 256, 'ts': 64, 'mode': 'ccm', 'adata': '', 'cipher': 'aes', 'salt': 'YWJjMTIzIT8=', 'ct': '8m443Sge/89sqN812tl5eK7FdN5cjTg='}",
          id: 7,
          jsonId: '2',
          keyId: '1',
          resource_uri: '/api/v1/ciphertext/7/'
        }
      ]

 */
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
 * @param {string} sharedKey Key (hex string) or passphrase (arbitrary string) for key generation. 
 * If it is a passphrase, a key will be generated from the passphrase
 * The key is shared with SSE TA for verification 
 * Example: "358610db4b113a5763111164e391b5ab2696577f44407f92dfb55581b76b34ce" as a key (number of hex characters = keysize/4), or "123" as a passphrase
 * @param {string} Kenc Key (hex string) or passphrase (arbitrary string) for key generation
 * The key will be used for data encryption
 * @param {string} keyid Unique key identification. This identification identifies the pair of (sharedKey,Kenc)
 * @param {boolean} iskey False if sharedKey, Kenc are passphrases, true if they are passphrases
 * @return {list} data The list of decrypted data
 * Example: { count: 1, objects: [ { firstname: 'David' } ] }
 */
function findKeyword(keyword, sharedKey, Kenc,keyid,iskey=false){
	console.log("Search keyword function");
	console.log("shared key:",sharedKey,"- iskey:",iskey);
	
	var KeyG,key;
	if(iskey == false) { // sharedKey is a passphrase. A key is generated from the passphrase
		KeyG = sjcl.codec.hex.toBits(computeKey(sharedKey,true)); // hex string -> array
		//console.log("KeyG (in array format):{}, in hex string format:{}",KeyG,computeKey(sharedKey,true));
		key = sjcl.codec.hex.toBits(computeKey(Kenc)); // hex string -> array
	} else {
		KeyG = sjcl.codec.hex.toBits(sharedKey); // sharedKey is a key
		console.log("KeyG (in array format):{},in hex string format:{}",KeyG,sharedKey);
		key = sjcl.codec.hex.toBits(Kenc);
	}
	
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
	var KeyW = encrypt(KeyG,hash(keyword)+searchNo,true); 
	console.log("key in array format:{}",KeyG);
	console.log("Search number: ",searchNo," - KeyW (encrypt with key): ",KeyW);
	
	// Increase search number:
	searchNo = searchNo + 1; //new
	
	// Compute new KeyW with the increased search number
	var newKeyW = encrypt(KeyG,hash(keyword)+searchNo,true);
	console.log("newKeyW (hash(keyword)+searchNo): ",hash(keyword)+searchNo);
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
 * This function is obsolete, and replaced by a new search() function which can support complex query
 * 
 * @param {json} data The json object containing the searched keyword. For instance: {"keyword": searched_keyword}
 * @param {string} sharedKey Key (hex string) or passphrase (arbitrary string) for key generation. 
 * If it is a passphrase, a key will be generated from the passphrase
 * The key is shared with SSE TA for verification 
 * Example: "358610db4b113a5763111164e391b5ab2696577f44407f92dfb55581b76b34ce" as a key (number of hex characters = keysize/4), or "123" as a passphrase
 * @param {string} Kenc Key (hex string) or passphrase (arbitrary string) for key generation. 
 * The key will be used for encryption
 * @param {string} keyid Unique key identification. This identification identifies the pair of (sharedKey,Kenc)
 * @param {boolean} iskey False if KeyG, Kenc are passphrases, true if they are passphrases
 * @return {list} data The list of decrypted data
 * Example: { count: 1, objects: [ { firstname: 'David' } ] }
 */
/*
function search(data, KeyG, Kenc,keyid,iskey=false){
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
	var results = findKeyword(keyword,KeyG,Kenc,keyid,iskey);
	return results;
}*/

/**
 * Compute the list of KeyW values
 * 
 * @param {list} Lhash List of hash values
 * @param {string} KeyG Key (hex string) or passphrase (arbitrary string) for key generation. 
 * If it is a passphrase, a key will be generated from the passphrase
 * The key is shared with SSE TA for verification 
 * Example: "358610db4b113a5763111164e391b5ab2696577f44407f92dfb55581b76b34ce" as a key (number of hex characters = keysize/4), or "123" as a passphrase
 * @param {list} LsearchNo List of search numbers
 * @param {number} offset The amount of increase/decrease in No.Search
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
		KeyW = encrypt(KeyG,w + searchno,true);	
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
 * @param {string} Kenc Key (hex string) or passphrase (arbitrary string) for key generation. 
 * If it is a passphrase, a key will be generated from the passphrase
 * The key will be used for data encryption 
 * Example: "358610db4b113a5763111164e391b5ab2696577f44407f92dfb55581b76b34ce" as a key (number of hex characters = keysize/4), or "123" as a passphrase
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
 * Create objects to update file numbers at SSE TA
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
 * Create a full list of file numbers/ search numbers of a list of hash values, 
 * where non-existed file numbers/ search numbers are represented as 0
 * 
 * @param {list} Lhash List of hash values
 * @param {list} Lexisted List of existed file numbers at SSE TA. It is equal to or a subset of Lhash
 * @param {list} Lfound List of existed and non-existed file numbers/ search numbers
 * @return {list} Lfull Full list of file numbers/ search numbers, where non-existed values are represented as 0.
 */
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
 * @param {string} sharedKey Key (hex string) or passphrase (arbitrary string) for key generation. 
 * If it is a passphrase, a key will be generated from the passphrase
 * The key will be shared with SSE TA for verification
 * Example: "358610db4b113a5763111164e391b5ab2696577f44407f92dfb55581b76b34ce" as a key (number of hex characters = keysize/4), or "123" as a passphrase
 * @param {string} Kenc Key (hex string) or passphrase (arbitrary string) for key generation. 
 * The key will be used for encryption
 * @param {string} keyid Unique key identification. This identification identifies the pair of (sharedKey,Kenc)
 * @param {boolean} iskey False if sharedKey, Kenc are passphrases, true if they are passphrases
 * @param {callback} callback Callback function
 * @return {boolean} True if updated successfully, False if otherwise
 */
function updateData(data, file_id, sharedKey, Kenc, keyid, iskey=false, callback=undefined){
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
	
	var KeyG, key;
	if(iskey == false) {// sharedKey is a passphrase. A key is generated from the passphrase
		KeyG = sjcl.codec.hex.toBits(computeKey(sharedKey,true)); // hex string -> array
		key = sjcl.codec.hex.toBits(computeKey(Kenc)); // hex string -> array
	} else {
		KeyG = sjcl.codec.hex.toBits(sharedKey); // sharedKey is a key
		key = sjcl.codec.hex.toBits(Kenc);
	}
	
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
	
	// get the full list of search no of current keywords, which involve keywords with no search = 0
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
 * @param {string} sharedKey Key (hex string) or passphrase (arbitrary string) for key generation. 
 * If it is a passphrase, a key will be generated from the passphrase
 * The key will be shared with SSE TA for verification
 * Example: "358610db4b113a5763111164e391b5ab2696577f44407f92dfb55581b76b34ce" as a key (number of hex characters = keysize/4), or "123" as a passphrase
 * @param {string} Kenc Key (hex string) or passphrase (arbitrary string) for key generation. 
 * If it is a passphrase, a key will be generated from the passphrase
 * The key will be used for encryption 
 * @param {string} keyid Unique key identification. This identification identifies the pair of (sharedKey,Kenc)
 * @param {boolean} iskey False if sharedKey, Kenc are passphrases, true if they are passphrases
 * @param {callback} callback Callback function
 * @return {boolean} True if deleted successfully, False if otherwise
 */
function deleteData(file_id, sharedKey, Kenc, keyid, iskey=false, callback=undefined){
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
		var KeyG, key;
		if(iskey == false) { // sharedKey is a passphrase. A key is generated from the passphrase
			KeyG = sjcl.codec.hex.toBits(computeKey(sharedKey,true)); // hex string -> array
			key = sjcl.codec.hex.toBits(computeKey(Kenc)); // hex string -> array
		} else {
			KeyG = sjcl.codec.hex.toBits(sharedKey); // sharedKey is a key
			key = sjcl.codec.hex.toBits(Kenc);
		}
		
		console.log("KeyG:",KeyG);
		
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
 * Generate key from passphrase using Pbkdf2
 * 
 * @param {string} pwdphrase The passphrase which is used for key generation
 * @param {boolean} ista If true, the generated key is shared with SSE TA. Otherwise, the key is only used at SSE client
 * @return {hex string} Key which is generated by Pbkdf2
 * Example: "358610db4b113a5763111164e391b5ab2696577f44407f92dfb55581b76b34ce" (number of hex characters = keysize/4)
 */
function computeKey(pwdphrase,ista=false){
	console.log("generating key from passphrase")
	var options={};
	var keysize;
	if(ista==false){
		options.salt = sjcl.codec.base64.toBits(sseConfig.salt)
		options.iter = sseConfig.iter
		keysize = sseConfig.ks
	}
	else{
		options.salt = sjcl.codec.base64.toBits(sseConfig.salt_ta)
		options.iter = sseConfig.iter_ta
		keysize = sseConfig.ks_ta
	}

	options = sjcl.misc.cachedPbkdf2(pwdphrase, options);
	var key = options.key.slice(0, keysize/32); // @return: list of item which is 4 bytes
	var key_hexa = sjcl.codec.hex.fromBits(key);  // convert to hex string
	console.log("key:",key,"key as hex string:",key_hexa)
	return key_hexa;  // hex string  
}

/**
 * Verify if the format and size of the key
 * Reference: https://www.sitepoint.com/community/t/how-to-check-if-string-is-hexadecimal/162739/2

 * @param {hex string} key The key. Example: "358610db4b113a5763111164e391b5ab2696577f44407f92dfb55581b76b34ce"
 * @param {number} size The expected size (the number of hex characters)= key size/ 4. Example: if the expected key size is 256 bits, the size of the key should be 256/4 = 64 hex characters
 * @return {boolean} ret true if the key is in the right format (hex string), and has the right size
 */
function isHexKey(key,size) {
	var re = /[0-9A-Fa-f]{6}/g;

	var ret = false;
	if(re.test(key) && key.length==size) {
	    ret = true;
	} 
	re.lastIndex = 0; // be sure to reset the index after using .test()
	return ret;
}

/**
 * Upload a shared key to SSE TA
 * 
 * @param {hex string} keyg Key (hex string)
 * @param {string} keyid The unique key identification
 * @return {boolean} true if uploading the key to SSE TA, false otherwise
 */
function uploadKeyG(keyg,keyid){
	if (isHexKey(keyg,sseConfig.ks_ta/4)==false){
		console.log("The input key is not valid. Please check if it is a hex string with the correct size.")
		return false;
	}
	
	console.log("uploading key:",keyg)
	
	if(sseConfig.sgx_enable==false) { // if SSE TA is not sgx-enabled
		var jsonData = '{ "key" : "' + keyg + '","keyId":"' + keyid + '"}';
		console.log("uploaded KeyG:",keyg)
		postRequest(sseConfig.base_url_ta + "/api/v1/key/", jsonData, undefined, async_feat = false);
	} else { //if SSE TA is sgx-enabled
		if(sseConfig.ks_ta!=128){
			console.log("SSE TA with sgx enabled can only support 128 bit keys. Please correct the value of sseConfig.ks_ta");
			return false;
		}
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
	}
	return true;
}

/////////////////////// SSE functions - End ///////////////////////

////////Progressive Encryption/Decryption for large blob data - Start////////
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
function encryptProgressBlob(blobData,fname,ftype, Kenc, keyId, iskey=false){
	console.log("Progress Encrypt Blob")
	console.log("blob content:",blobData)
	return function(resolve) {
		var reader = new FileReader()
		reader.onload = function(e){
			var imageData = new Uint8Array(e.target.result);
			console.log("Blob content:",imageData);    	    
			
			var iv = sjcl.hash.sha1.hash(sseConfig.iv).slice(0,4); // IV should be an array of 4 words. Get 4 words to create iv

	        var key;
			if(iskey == false) {// Kenc is a passphrase. A key is generated from the passphrase
				console.log("generating key")
				key = sjcl.codec.hex.toBits(computeKey(Kenc)); // hex string -> array
			} else {
				key = sjcl.codec.hex.toBits(Kenc); // Kenc is a key
			}
			
			var aes = new sjcl.cipher.aes(key); //key must be an array of 4,6 or 8 words
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
		    
		    var no_chunks = Math.ceil(imageData.length/sliceSizeRange);
		    console.log("number of chunks:",no_chunks);
		    var is_final = false; // indicating if the encryptor is finalized or not
		    
		    while (slice[0] < imageData.length) {
		    	result = result.concat(enc.process(sjcl.codec.bytes.toBits(imageData.slice(slice[0], slice[1]))));
		        slice[0] = slice[1];
		        slice[1] = slice[0] + sliceSizeRange;
		        if(slice[1]>imageData.length)
		        	slice[1] = imageData.length;
		        
		        count = count +1 ;		        
		        
		        if((count % sseConfig.no_chunks_per_upload)==0){ //upload each part of #fragment chunks/ slices.
					if(count==no_chunks){ // if this is the final chunk, finalize the encryption
						result = result.concat(enc.finalize());
						is_final = true;
					}
					
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
		    if(is_final==false){ // if the encryptor is not finalized yet
			    result = result.concat(enc.finalize());
			    console.log("Last part ciphertext:",result)
			    tb[idx]=result;
			    console.log("tb[idx]:",tb[idx])
		    	idx = idx+1;
			    
			    cipherpart = new Blob([result], { type: ftype });
	        	outputname= fname + "_part" + idx  + keyId;
	        	uploadMinio(cipherpart,outputname);
		    }
        	
		    // upload metadata
        	outputname= fname + "_meta" + keyId;
        	cipherpart = new Blob([idx], { type: ftype });
        	uploadMinio(cipherpart,outputname);
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
function encryptProgressUploadSearchableBlob(blob,fname,jsonObj,file_id, KeyG, Kenc,keyId, iskey=false, callback=undefined){
	if(KeyG == Kenc){
		console.log("The two provided passphrases/ keys should be different to avoid SSE TA to learn the encryption key!")
		return false;
	}
	//append filename to metadata
	jsonObj.filename = fname;
	console.log("metadata after appending filename:{}",jsonObj);
	encryptProgressUploadBlob(blob,fname,Kenc,keyId,iskey);
	uploadData(jsonObj,file_id,KeyG,Kenc,keyId,iskey);
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
function encryptProgressUploadBlob(blob,fname,Kenc,keyId,iskey=false,callback=undefined){
    var ftype = blob.type;
    console.log("blob type:",ftype);

    var promise = new Promise(encryptProgressBlob(blob,fname,ftype,Kenc,keyId,iskey));

    // Wait for promise to be resolved, or log error.
    promise.then(function(cipherBlob) {
    	console.log("Completed encrypting blob. Now send data to server.")
    }).catch(function(err) {
    	console.log('Error: ',err);
    });
    return promise;
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
function downloadProgressDecryptBlob(fname,Kenc,keyId,iskey=false,callback=undefined){
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

        var key;
		if(iskey == false) {// Kenc is a passphrase. A key is generated from the passphrase
			console.log("generating key")
			key = sjcl.codec.hex.toBits(computeKey(Kenc)); // hex string -> array
		} else {
			key = sjcl.codec.hex.toBits(Kenc); // Kenc is a key
		}
		
        var aes = new sjcl.cipher.aes(key); //key must be an array of 4,6 or 8 words
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
 * Convert from an array of bytes to a bitArray. 
 * This function is referenced from internet.
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
 * Convert from a bitArray to an array of bytes. 
 * This function is referenced from internet.
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
 * @return {} The blob is saved as a file in Download folder
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
////////Progressive Encryption/Decryption for large blob data - End////////

/////////////////////// CP-ABE-RELEVANT FUNCTIONS - Start ///////////////////////
/**
 * Encrypt and upload SSE keys to Keytray
 * 
 * @param {hex string} verkey The verification key which will be shared with SSE TA 
 * @param {hex string} enckey The encryption key which will be used to encrypt data
 * @param {string} token Access token
 * @return {string} keyid The unique key identification 
 */
function uploadSSEkeys(verkey,enckey,token){
	if(verkey=="" || enckey==""){
		console.log("Lack of passphrases/keys");
		return false;
	}
	
	var ver_key,enc_key;
	if(isHexKey(verkey,sseConfig.ks_ta/4) == false || isHexKey(enckey,sseConfig.ks/4)==false){
		console.log("Please check if the keys are hex strings, and they have the correct size.")
		return false;
	}
	
	console.log("Sending keys to KeyTray")
	var header = { Authorization: "Bearer " + token };
	var jsonData = '{ "verKey" : "' + verkey + '","encKey":"' + enckey + '"}';
	console.log("json data:",jsonData);
	console.log("header:",header);
	var res = postRequest(sseConfig.base_url_cp_abe + "/api/v1/put", jsonData, undefined, async_feat = false,header);
    var keyid = res.responseText.slice(1,-1); // slice() is to remove " character at the beginning and the end of the returned value
	return keyid;
}

/**
 * Retrieve and decrypt the encrypted SSE keys from KeyTray
 * 
 * @param {string} keyid The unique key identification 
 * @param {string} username User name
 * @param {string} token Access token
 * @return {json} keys The pair of SSE keys 
 */
/**
 * Retrieve and decrypt the encrypted SSE keys from KeyTray
 * 
 * @param {string} keyid The unique key identification 
 * @param {string} username User name
 * @param {string} token Access token
 * @return {json} ret.responseText The pair of SSE keys 
 */
function getSSEkeys(keyid,username,token){
	if(keyid=="" || username=="" || token==""){
		console.log("Lack of key id or username or token");
		return false;
	}
	var jsonData = '{ "uuid" : "' + keyid + '","username":"' + username + '"}';
	
	var header = { Authorization: "Bearer " + token };
	
	var ret = postRequest(sseConfig.base_url_cp_abe + "/api/v1/get", jsonData, undefined, async_feat = false, header);
	return ret.responseText;
}

/////////////////////// CP-ABE-RELEVANT FUNCTIONS - End ///////////////////////

/////////////////////// COMPLEX-QUERY SEARCH FUNCTION - Start ///////////////////////
/**
 * Convert infix expression to postfix expression
 * Reference: https://jsfiddle.net/DerekL/rm9feo32/
 *
 * @param {string} exp Infix expression. Example: '1 + 2'
 * @returns {list} List of numbers and operators of the postfix expression. Example: [1,"+",2]
 */
function infixToPostfix(infix){
    const presedences = ["+", "*"];

    var opsStack = [],
    postfix = [];

    for(let token of infix){
        // Step 1
        if("number" === typeof token){
             postfix.push(token); continue;
        }
        let topOfStack = opsStack[opsStack.length - 1];
        // Step 2
        if(!opsStack.length || topOfStack == "("){
             opsStack.push(token); continue;
        }
        // Step 3
        if(token == "("){
             opsStack.push(token); continue;
        }
        // Step 4
        if(token == ")"){
             while(opsStack.length){
                 let op = opsStack.pop();
                 if(op == "(")   break;
                 postfix.push(op);
             }
             continue;
        }
        // Step 5
        let prevPresedence = presedences.indexOf(topOfStack),
        currPresedence = presedences.indexOf(token);
        while(currPresedence < prevPresedence){
             let op = opsStack.pop();
             postfix.push(op);
             prevPresedence = presedences.indexOf(opsStack[opsStack.length - 1]);
        }
        opsStack.push(token);
    }
        // Step 6
    while(opsStack.length){
         let op = opsStack.pop();
         if(op == "(")   break;
         postfix.push(op);
    }

    return postfix;
}

/**
 * Convert infix expression (string) to list of numbers and operators
 * Reference: https://jsfiddle.net/DerekL/rm9feo32/
 *
 * @param {string} exp Infix expression. Example: '1 + 2'
 * @returns {list} List of numbers and operators. Example: [1,"+",2]
 */
function tokenize(exp){
        return exp
        .replace(/\s/g, "")
        .split("")
        .map((token, i) => /^\d$/.test(token) ? +token : token);
}

/**
 * Search by a json object containing the searched keywords by a complex condition
 * The complex condition is built upon AND (*), OR (+)
 *
 * @param {json} data The json object containing the searched keywords and expression.
 * For instance:
{
      "keyword" : ["name|david","job|doctor","age|28"],
      "condition" : "(1+3)*2"
} to search by the condition: (name==david OR age==28) AND (job==doctor) 
 * @param {string} KeyG Key (hex string) or passphrase (arbitrary string) for key generation.
 * If it is a passphrase, a key will be generated from the passphrase
 * The key is shared with SSE TA for verification
 * Example: "358610db4b113a5763111164e391b5ab2696577f44407f92dfb55581b76b34ce" as a key (number of hex characters = keysize/4), or "123" as a passphrase
 * @param {string} Kenc Key (hex string) or passphrase (arbitrary string) for key generation.
 * The key will be used for encryption
 * @param {string} keyid Unique key identification. This identification identifies the pair of (sharedKey,Kenc)
 * @param {boolean} iskey False if KeyG, Kenc are passphrases, true if they are passphrases
 * @return {list} data The list of decrypted data
 * Example: { count: 1, objects: [ { firstname: 'David' } ] }
 */
function search(data, KeyG, Kenc,keyid,iskey=false){
	if(data=={} || KeyG=="" || Kenc=="" || keyid==""){
		console.log("Lack of parameter of search function")
        return {};
    }
    console.log("json object:",data);
    console.log("keys:",KeyG,",",Kenc);
    var criteria = data['keyword'];
    var exp = data['condition'];
    if(criteria==undefined){
        console.log("Invalid input file: lack of search keyword(s)")
        return {};
    }
    else if (exp==undefined || exp ==""){
        if(criteria.length==1){ // search for single keyword
            console.log("Search for single keyword")
            return findKeyword(criteria[0],KeyG,Kenc,keyid,iskey);
        } else if(typeof criteria=='string') { // search for single keyword
            console.log("Search for single keyword")
            return findKeyword(criteria,KeyG,Kenc,keyid,iskey);
        }
        else {// error syntax (there are many critera without condition description
              console.log("Invalid input file: lack of search condition");
              return {};
        }
    } else {
    	console.log("complex search with keys:",KeyG,",",Kenc);
        var infix = tokenize(exp); // convert an infix string to array of numbers and operators
        var postfix = infixToPostfix(infix);
        console.log("Infix expression:",infix);
        console.log("Postfix expression:",postfix);
        var ret = computePostfix(criteria,postfix,KeyG,Kenc,keyid,iskey);
        console.log("result:",ret);
        return ret;
    }
}

/**
 * Compute postfix expression
 * Based on: https://www.thepolyglotdeveloper.com/2015/04/evaluate-a-reverse-polish-notation-equation-with-javascript/
 *
 * @param {list} criteria The search keywords
 * @param {list} postfix List of numbers and operators of the postfix expression
 * @param {string} KeyG Key (hex string) or passphrase (arbitrary string) for key generation.
 * If it is a passphrase, a key will be generated from the passphrase
 * The key is shared with SSE TA for verification
 * Example: "358610db4b113a5763111164e391b5ab2696577f44407f92dfb55581b76b34ce" as a key (number of hex characters = keysize/4), or "123" as a passphrase
 * @param {string} Kenc Key (hex string) or passphrase (arbitrary string) for key generation.
 * The key will be used for encryption
 * @param {string} keyid Unique key identification. This identification identifies the pair of (sharedKey,Kenc)
 * @param {boolean} iskey False if KeyG, Kenc are passphrases, true if they are passphrases
 * @returns {json} resultStack.pop() The list of decrypted data
 * Example: { count: 1, objects: [ { firstname: 'David' } ] }
 */
function computePostfix(criteria,postfix,KeyG,Kenc,keyid,iskey=false){
	var resultStack = [];
    for(var i = 0; i < postfix.length; i++) {
        if(typeof postfix[i] === 'number') {
             if(postfix[i]>criteria.length){
                 console.log("Condition is invalid")
                 return {}
             } else {
                 resultStack.push(criteria[postfix[i]-1]);
             }
        } else {
            var a = resultStack.pop();
            var b = resultStack.pop();
            console.log("a:",a,"b:",b);
            var ret;
            if(postfix[i] === "+") {
                ret = search_or(a,b,KeyG,Kenc,keyid,iskey)
                console.log("res:",ret)
                resultStack.push(ret);
            } else if(postfix[i] === "*") {
                ret = search_and(a,b,KeyG,Kenc,keyid,iskey)
                console.log("res:",ret)
                resultStack.push(ret);
            }
        }
    }
    
    if(resultStack.length > 1) {
         console.log("Condition is invalid")
         return {};
    } else {
         return resultStack.pop();
    }
 }

/**
* Search with AND condition
*
* @param {string or Json} keyword1 The 1st keyword (string), or a list of decrypted data (json)
* @param {string or Json} keyword2 The 2nd keyword (string), or a list of decrypted data (json)
* @returns {json} results The list of decrypted data
* Example: { count: 1, objects: [ { firstname: 'David' } ] }
*/
function search_and(keyword1,keyword2,KeyG,Kenc,keyid,iskey=false){
	console.log("keyword 1:",keyword1,"-keyword2:",keyword2);
	var ret1, ret2;
	if(typeof keyword1=='string')
		ret1 = findKeyword(keyword1,KeyG,Kenc,keyid,iskey);
	else // if keyword1 is a json object
		ret1 = keyword1;
	
	if(typeof keyword2=='string')
		ret2 = findKeyword(keyword2,KeyG,Kenc,keyid,iskey);
	else
		ret2 = keyword2;
	
    console.log("operand 1:",ret1);
    console.log("operand 2:",ret2);
    var results = {"count":0,"objects":[]};
    
    var w;
    if(typeof keyword1=='string'){
        console.log("loop through ret2")
        w= keyword1.split('|');
        for(var i=0;i<ret2.count;i++){
        	console.log("i:",i)
        	console.log("considering item:",ret2.objects[i])
            if(ret2.objects[i].hasOwnProperty(w[0]) && ret2.objects[i][w[0]]==w[1]) {
            	 console.log("temporary result:",results)
            	 
            	 console.log("exist?",results.objects.some(item => item === ret2.objects[i]))
            	 if (results.objects.some(item => item === ret2.objects[i])==false) { //if not existing in results
            		 console.log('add item:',ret2.objects[i])
            	 	 results.count = results.count+1;
                     results.objects.push(ret2.objects[i]);
                 }
            }
        }
    } else if(typeof keyword2=='string'){
        console.log("loop through ret1")
        w= keyword2.split('|');
        for(i=0;i<ret1.count;i++){
        	console.log("i:",i)
        	console.log("considering item:",ret1.objects[i])
            if(ret1.objects[i].hasOwnProperty(w[0]) && ret1.objects[i][w[0]]==w[1]){
            	console.log("temporary result:",results)
            	if (results.objects.some(item => item === ret1.objects[i])==false) { //if not existing in results
            		console.log('add item:',ret1.objects[i])
            		results.count = results.count+1;
                    results.objects.push(ret1.objects[i]);
                }
            }
        }
    }    
    console.log("result of search with AND condition:",results);
    return results;
}

/**
 * Search with OR condition
 *
 * @param {string or Json} keyword1 The 1st keyword (string), or a list of decrypted data (json)
 * @param {string or Json} keyword2 The 2nd keyword (string), or a list of decrypted data (json)
 * @returns {json} results The list of decrypted data
 * Example: { count: 1, objects: [ { firstname: 'David' } ] }
 */
function search_or(keyword1,keyword2,KeyG,Kenc,keyid,iskey=false){
	console.log("keyword 1:",keyword1,"-keyword2:",keyword2);
	if(typeof keyword1=='string')
		ret1 = findKeyword(keyword1,KeyG,Kenc,keyid,iskey);
	else // if keyword1 is a json object
		ret1 = keyword1;
	
	if(typeof keyword2=='string')
		ret2 = findKeyword(keyword2,KeyG,Kenc,keyid,iskey);
	else
		ret2 = keyword2;
	
    console.log("operand 1:",ret1);
    console.log("operand 2:",ret2);
    var results = {"count":0,"objects":[]};
    for(var i=0;i<ret1.count;i++){
       results.objects.push(ret1.objects[i]);       
    }
    results.count = ret1.count;
    
    for(var i=0;i<ret2.count;i++){
    	if (!results.objects.some(item => item === ret2.objects[i])) {
        	 results.count = results.count + 1;
        	 results.objects.push(ret2.objects[i]);
        }
    }
    console.log("result of search with OR condition:",results);
    return results;

}
/////////////////////// COMPLEX-QUERY SEARCH FUNCTION - End ///////////////////////

////////(to be developed) Progressive Encryption/Decryption for medium blob data - Start////////
/**
 * Download chunks of ciphertext from MinIO server, decrypt them and save as 1 plaintext file
 * This function can support medium files (~100MB)
 * 
 * @param {string} fname File name
 * @param {string} Kenc Key or passphrase for key generation. The key is used for encrypting data. //needed test
 * @param {string} keyId Unique key identification
 * @param {callback} callback Callback function
 * @return {} Download multiple of plaintext chunk files, and a script file (concat_script.txt) to merge them into one plaintext file
 */
/*
function downloadProgressDecryptMediumBlob(fname,Kenc,keyId,callback=undefined){
    console.log("Download blob")
    try {
    	var metafile = fname + "_meta" + keyId;
    	var presigned_url = getPresignUrl(metafile);  
    	var fragments = [];
    	var n = 0;
    	var threshold=30;
        $.ajax({
        	url: presigned_url,
            type: 'GET',
            async: false,
            success: function(blob, status) { 
            	//create a list which contains names of ciphertext chunks
                console.log("meta data:",blob);
                n = blob;
                if(n>threshold){
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
                }
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
        
        var imageArr = []
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
     				if(n>threshold){
	     				var imageDecryptBlob = new Blob([imageByte], { type: ftype });
	     				var j = i+1;
	     				saveBlob(imageDecryptBlob,fname+j);
                	} else {
     					imageArr.push(imageByte);
     				}
           		},
                error: function(erro){
                     console.log("Download from Minio Error");
                     console.log(erro);
                 }
                })	
        }
        if(n<=threshold){
        	var imageDecryptBlob = new Blob(imageArra, { type: ftype });
        	saveBlob(imageDecryptBlob,fname);
        }
    } catch (e) {
        console.log("Error:" + e);
    }    
}*/
////////Progressive Encryption/Decryption for medium blob data - End////////

////////Encryption/Decryption (non-progressively) for small blob data - Start////////
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
/*
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
}*/

/**
 * Encrypt blob data of small size (<=10MB)
 * 
 * @param {blob} blobData The blob data
 * @param {string} ftype File type
 * @param {string} Kenc Key or passphrase for key generation. The key will be used for encryption //needed test
 * @return {promise} A promise to create blob of encrypted data
 */
/*
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
 }*/

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
/*
function encryptUploadSearchableBlob(blob,fname,jsonObj,file_id, KeyG, Kenc,keyId,callback=undefined){
	//append filename to metadata
	jsonObj.filename = fname;
	console.log("metadata after appending filename:{}",jsonObj);
	encryptUploadBlob(blob,fname,Kenc,keyId);
	uploadData(jsonObj,file_id,KeyG,Kenc,keyId);
}*/

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
/*
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
}*/

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
/*
function decryptSaveBlob(blob,fname,Kenc,callback=undefined){
	 var outputname = fname;//fname.split(".")[0];// + "_decrypted";
	 console.log("Filename to be saved: " +  outputname);
	 var ftype = blob.type; //identify filetype from blob
	 
	 var promise = new Promise(decryptBlob(blob,ftype,Kenc));
	 
	 promise.then((plainBlob) => {
		 console.log("Save file to disk");
		 saveBlob(plainBlob,outputname);
		 if(callback!=undefined){
			callback(true); // for jest
		}
	 })
	 return promise;
}*/

/**
 * Decrypt a ciphertext downloaed from MinIO server
 * This function can support only small files (<10MB)
 * 
 * @param {blob} blobCipher Ciphertext downloaded from MinIO server
 * @param {string} ftype File type 
 * @param {string} Kenc Key or passphrase for key generation. The key is used for encrypting data. //needed test
 * @return {promise} Promise to create the decrypted blob
 */
/*
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
}*/

/**
 * Generate a key from a passphrase with Pbkdf2 function, 
 * then encrypt the key with RSA PKCSv1.5 using the public key retrieved from the TA, 
 * and upload it to SSE TA
 *
 * @param {string} pwdphrase The passphrase to generate a key.
 * @param {string} keyid The unique key identification
 */
/*
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
}*/
////////Encryption/Decryption (non-progressively) for small blob data - End////////
