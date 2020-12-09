// For automatic tests with Jest
//const $ = require('./jquery-3.4.1.min.js') // for jest automatic testing
//const sjcl = require('./sjcl.js') // for jest automatic testing
//module.exports = [uploadData,search,updateData,deleteData,uploadKeyG,encryptUploadBlob,downloadDecryptBlob]; // for jest automatic testing

/// For benchmarking
//let sjcl = require('./sjcl');
//let btoa = require('../../../Benchmark/node_modules/btoa');
//let dom = new (require('../../../Benchmark/node_modules/jsdom').JSDOM)(' '); // create mock document for jquery
//let $ = require('../../../Benchmark/node_modules/jquery')(dom.window);
//exports.uploadData = uploadData;
//exports.updateData = updateData;
//exports.search = search;
//exports.uploadKeyG = uploadKeyG;

/// SSE CONFIGURATION
HTTP_CODE_CREATED = 201;

var sseConfig = {
  base_url_ta: "ta_url", //This will be replaced with correct value at runtime at the web server
  base_url_sse_server: "sse_url", //This will be replaced with correct value at runtime at the web server
  salt: "salt_value", // salt value for encryption. This will be replaced with correct value at runtime at the web server
  iv: "iv_value", // iv for encryption. This will be replaced with correct value at runtime at the web server
  iter: 10000,
  ks: 128,
  ts: 64,
  hash_length: 256,
};

/// REQUESTS: Get, Post, Put
function getRequest(api_url) {
  var ret = null;

  $.ajax({
    url: api_url,
    type: "GET",
    async: false, // disable asynchronous, to wait for the response from the server
    success: function (data) {
      ret = data;
    },
    error: function (erro) {
      console.error("Get Request Error");
    },
  });
  return ret;
}

// async_feat: asynchronous (if true) or not (if false)
function postRequest(
  api_url,
  jsonObj,
  callback = undefined,
  async_feat = true
) {
  console.log("data:", jsonObj);
  result = $.ajax({
    url: api_url,
    type: "POST",
    contentType: "application/json",
    data: jsonObj,
    async: async_feat,
    success: function (data) {
      if (callback != undefined) {
        callback(data);
      }
    },
    error: function (erro) {
      console.error("Post Request Error");
    },
  });
  console.log("response of post request:", result);
  return result;
}

//async_feat: asynchronous (if true) or not (if false)
function putRequest(api_url, jsonObj, callback, async_feat = true) {
  $.ajax({
    url: api_url,
    type: "PUT",
    contentType: "application/json",
    data: jsonObj,
    async: async_feat,
    success: function (data) {
      if (callback != undefined) {
        callback(data);
      }
    },
    error: function (erro) {
      console.error("Put Request Error");
    },
  });
}

function patchRequest(api_url, jsonObj, callback, async_feat = true) {
  console.log("Run patch request");
  $.ajax({
    url: api_url,
    type: "PATCH",
    contentType: "application/json",
    data: jsonObj,
    async: async_feat,
    success: function (data) {
      //console.log("success patch request")
      if (callback != undefined) {
        //callback(data);
        callback(true); //this serves automatic tests with jest
      }
    },
    error: function (erro) {
      console.error("Patch Request Error");
    },
  });
}
/// REQUESTS - End

/// BASIC FUNCTIONS
// Hash SHA256
function hash(input) {
  var bitArray = sjcl.hash.sha256.hash(input);
  var ret = sjcl.codec.hex.fromBits(bitArray);
  return ret;
}

// Encrypt data
// Parameters: input - data, key - symmetric key
function encrypt(key, input) {
  var salt = btoa(sseConfig.salt);
  var iv = btoa(sseConfig.iv);
  var options = {
    mode: "ccm",
    iter: sseConfig.iter,
    ks: sseConfig.ks,
    ts: sseConfig.ts,
    v: 1,
    cipher: "aes",
    adata: "",
    salt: salt,
    iv: iv,
  }; //define salt, mode for encryption

  var res = sjcl.encrypt(key, input, options);
  return res; // return a ciphertext object
}

// Decrypt a ciphertext object
// Parameters: key - symmetric key, cipherObj - ciphertext object
function decrypt(key, cipherObj) {
  var res = "";
  try {
    res = sjcl.decrypt(key, cipherObj);
  } catch (err) {
    console.log("error in decrypting:", err);
  }
  return res;
}

//Retrieve file numbers/ search numbers of a list of keywords
//Params: requestType - searchno or fileno, Lw - list of keywords
function getMultiFileOrSearchNo(requestType, Lw, keyid) {
  var data_ta = JSON.stringify({
    requestType: requestType,
    Lw: Lw,
    keyId: keyid,
  });
  console.log("Invoke longrequest");
  console.log(data_ta);
  var ret = postRequest(
    sseConfig.base_url_ta + "/api/v1/longrequest/",
    data_ta,
    (callback = undefined),
    (async_feat = false)
  );

  var obj = ret.responseJSON;
  console.log(obj);
  Lno = [];
  LnoUri = [];
  listW = [];

  var count = obj.objects.length;
  for (i = 0; i < count; i++) {
    if (requestType == "searchno") Lno.push(obj.objects[i].searchno);
    else Lno.push(obj.objects[i].fileno);
    LnoUri.push(
      sseConfig.base_url_ta +
        "/api/v1/" +
        requestType +
        "/" +
        obj.objects[i].id +
        "/"
    );
    listW.push(obj.objects[i].w); //list of keyword, which No.Search exists
  }
  console.log("List of no:", Lno);
  console.log("List of uri:", LnoUri);
  console.log("list of w:", listW);
  return [Lno, LnoUri, listW];
}
/// BASIC FUNCTIONS - END

//Upload data (json object)
//Input: data - data as json object, file_id - file identifier which must be unique, KeyG, Kenc - symmetric keys
function uploadData(data, file_id, sharedKey, Kenc, keyid, callback) {
  if (
    data == {} ||
    file_id == "" ||
    sharedKey == "" ||
    Kenc == "" ||
    keyid == ""
  ) {
    console.log("Lack of parameter of uploadData function");
    return false;
  }
  // verify if file_id existed
  var ret = getRequest(
    sseConfig.base_url_sse_server +
      "/api/v1/ciphertext/?limit=1&jsonId=" +
      file_id +
      "&keyId=" +
      keyid
  );
  if (ret.meta["total_count"] > 0) {
    console.log("Existed file id");
    return false;
  }

  var KeyG = computeKeyG(sharedKey);
  console.log("KeyG in upload:", KeyG);
  var key = hash(Kenc); //generate encryption key from inputed passphrase Kenc

  console.log("URL TA:", sseConfig.base_url_ta);

  console.log("json object:", data);

  console.log(
    "1st item in json object:",
    Object.keys(data)[0],
    Object.values(data)[0]
  );

  var json_keys = Object.keys(data); // keys of json objects
  var json_values = Object.values(data); // values of json objects
  var length = json_keys.length; // number of json objects
  var i, w;

  var listHw = [],
    arrW = []; //listHw be the list of hashed keywords, arrW be the list of keywords
  for (i = 0; i < length; i++) {
    w = json_keys[i] + "|" + json_values[i]; //separate key and value by ;
    arrW.push(w); //list of keyword
    listHw.push(hash(w)); // list of hashed keyword
  }

  console.log("list of uploaded keywords:", arrW);
  console.log("list of hashed keywords:", listHw);

  var data_ta = JSON.stringify({ Lw: listHw, keyId: keyid });
  console.log("Data sent to TA:", data_ta);

  // Request meta data fileNo and searchNo from TA, and increase fileNo for uploaded keywords
  // If a keyword is new, create fileNo in TA; if a keyword is existed, update fileNo in TA
  console.log("Send post request to TA from object:", data); // for testing
  var ta_response = postRequest(
    sseConfig.base_url_ta + "/api/v1/upload/",
    data_ta,
    undefined,
    false
  );

  var json_response = ta_response.responseJSON;
  var Lfileno = ta_response.responseJSON["Lfileno"];
  var Lsearchno = ta_response.responseJSON["Lsearchno"];
  console.log("data back from TA:", Lfileno, Lsearchno);

  var Lcipher = '{"objects": ['; //list of cipher objects in PATCH request
  var Laddress = '{"objects": ['; //list of address objects in PATCH request

  var l = listHw.length; //LfileNo.length can be less than listW.length
  var searchno, fileno, item, kw;
  for (i = 0; i < l; i++) {
    // For all keywords
    hw = listHw[i]; // hashed of keyword
    var len = Lfileno.length;
    var item, element;
    for (j = 0; j < len; j++) {
      element = Lfileno[j];
      if (element.w == hw) {
        item = element;
        j = len;
      }
    }

    console.log("found item:", item);
    fileno = item.fileno;
    console.log("found fileno:", fileno);

    // retrieve searchNo of the keyword
    len = Lsearchno.length;
    for (j = 0; j < len; j++) {
      element = Lsearchno[j];
      if (element.w == hw) {
        item = element;
        searchno = item.searchno;
        j = len + 1; // exit For loop
      }
    }
    if (j == len)
      // not found searchno
      searchno = 0;

    // Compute the key KeyW
    KeyW = encrypt(KeyG, hw + searchno);
    console.log(" - Hash of keyword:", hw, " -Search number:", searchno);
    console.log("KeyW object:", KeyW);

    // Retrieve ciphertext value from the ciphertext object KeyW
    KeyW_ciphertext = JSON.parse(KeyW).ct;
    console.log("KeyW_ciphertext:", KeyW_ciphertext);

    //Encrypt keyword
    kw = arrW[i];
    var c = encrypt(key, kw);
    Lcipher +=
      '{ "jsonId" : "' +
      file_id +
      '","data" : ' +
      c +
      ',"keyId":"' +
      keyid +
      '"},'; // List of ciphertexts of keywords

    // Compute the address in the dictionary
    var input = KeyW_ciphertext + fileno + "0";
    var addr = hash(input);
    //console.log("type of address:", typeof addr)
    console.log("hash input to compute address:", input);
    console.log("Address:" + addr);

    // Compute value of entry in the dictionary (Map)
    var val = file_id; //Do not encrypt json_id anymore
    console.log(
      "json_id:",
      val,
      " - file number:",
      fileno,
      " - value of entry in the dictionary:",
      val
    );
    Laddress +=
      '{ "address" : "' +
      addr +
      '","value" : "' +
      val +
      '","keyId":"' +
      keyid +
      '"},'; // the dictionary (Map)
  }

  Lcipher = Lcipher.slice(0, -1);
  Lcipher += "]}";
  console.log("Lcipher:", Lcipher);

  Laddress = Laddress.slice(0, -1);
  Laddress += "]}";
  console.log("Laddress:", Laddress);

  console.log("Send patch request from object:", data); //for testing
  // Send ciphertext to CSP
  patchRequest(
    sseConfig.base_url_sse_server + "/api/v1/ciphertext/",
    Lcipher,
    callback,
    (async_feat = false)
  );

  // Send the dictionary to CSP
  patchRequest(
    sseConfig.base_url_sse_server + "/api/v1/map/",
    Laddress,
    callback,
    (async_feat = false)
  );

  console.log("complete upload");

  return true;
}

//Decrypt data retrieved from CSP
//Input: response - data retrieved from CSP, Kenc - symmeric key, keyword - the searched keyword
//Output: json object containing count (number of data objects), and objects (list of data objects)
function retrieveData(response, Kenc, searchNo, searchNoUri, keyword, keyid) {
  console.log("response of search:", response);
  var data;
  var msg = "";
  if (response == undefined) {
    //found 0 results
    found = 0;
    data = '{"count":' + found + ',"objects":[]}';
  } else if (response.Cfw.length == 0) {
    // found 0 due to wrong key
    msg = response.KeyW;
    found = 0;
    data = '{"count":' + found + ',"objects":[]}';
  } else {
    // found >= 1 results
    found = response.Cfw.length;
    console.log("length of response:", found);
    console.log("content of response:", response.Cfw);

    data = '"objects":' + "[";

    for (var j = 0; j < found; j++) {
      var objs_data = response.Cfw[j];
      var length = objs_data.length;

      data = data + "{";
      for (var i = 0; i < length; i++) {
        var ct = objs_data[i].data;
        console.log("encrypted data:", ct);
        var ct_reformat = ct.replace(new RegExp("'", "g"), '"'); //replace ' with "
        var text = decrypt(Kenc, ct_reformat);

        var pair = text.split("|");
        console.log("decrypted data:", text);
        data = data + '"' + pair[0] + '":"' + pair[1] + '",';
      }
      //remove the last comma
      data = data.slice(0, -1);
      data = data + "},";
    }

    //remove the last comma
    data = data.slice(0, -1);
    data = '{"count":' + found + "," + data + "]}";
    console.log("Json string:", data);
  }

  console.log("message from search:", msg);
  if (msg != "error") {
    // if found 0 is not due to wrong key
    // Update search number to TA in both cases: found, and not found
    if (searchNo == 1) {
      // If the keyword is new, create searchNo in TA
      var jsonData =
        '{ "w" : "' +
        hash(keyword) +
        '","searchno" : ' +
        searchNo +
        ',"keyId":"' +
        keyid +
        '"}';
      console.log("Create new entry in searchNo: ", jsonData);
      postRequest(
        sseConfig.base_url_ta + "/api/v1/searchno/",
        jsonData,
        undefined,
        (async_feat = false)
      ); //async_feat=true to searve jest automatic testing
    } else {
      // If the keyword is existed, update searchNo in TA
      console.log("Update the entry in searchno");
      putRequest(
        searchNoUri,
        '{ "searchno" : ' + searchNo + "}",
        undefined,
        (async_feat = false)
      ); //async_feat=true to searve jest automatic testing
    }
  }
  return JSON.parse(data);
}

// Decrypt data
function decryptData(cipherList, Kenc) {
  var found = cipherList.length;
  console.log("length of list:", found);
  console.log("ciphertext list:", cipherList);

  var data = [];

  for (var j = 0; j < found; j++) {
    var ct = cipherList[j].data;
    console.log("encrypted data:", ct);
    var ct_reformat = ct.replace(new RegExp("'", "g"), '"'); //replace ' with "
    var text = decrypt(Kenc, ct_reformat);
    console.log("decrypted data:", text);
    data.push(text);
  }

  console.log("List of plaintexts:", data);
  return data;
}

//Search keyword function
//Input: keyword (string) - keyword, KeyG, Kenc - symmetric keys
function findKeyword(keyword, sharedKey, Kenc, keyid) {
  console.log("Search keyword function");

  var KeyG = computeKeyG(sharedKey);
  var key = hash(Kenc);

  var fileNo, fileNoUri;

  // Get file number
  [LfileNo, LfileNoUri, listW] = getMultiFileOrSearchNo(
    "fileno",
    [hash(keyword)],
    keyid
  ); //"listW" can be different from Lw. It does not contain new keywords (if existed) in Lw
  console.log("Lfileno:", LfileNo);
  if (LfileNo.length > 0) {
    fileNo = LfileNo[0];
    fileNoUri = LfileNoUri[0];
  } else {
    fileNo = 0;
    fileNoUri = "";
  }

  console.log("file number:", fileNo, ", fileNoUri:", fileNoUri);

  // Get search number
  var searchNo, searchNoUri;
  [LsearchNo, LsearchNoUri, tempListWord] = getMultiFileOrSearchNo(
    "searchno",
    [hash(keyword)],
    keyid
  ); //"listW" can be different from Lw. It does not contain new keywords (if existed) in Lw
  console.log("List of search number:", LsearchNo);
  if (LsearchNo.length > 0) {
    searchNo = LsearchNo[0];
    searchNoUri = LsearchNoUri[0];
    console.log("Exists search no");
  } else {
    searchNo = 0;
    searchNoUri = "";
    console.log("Does not exist search no");
  }

  console.log(" - searchNo: ", searchNo, " - searh number url: ", searchNoUri);

  // Compute KeyW
  var KeyW = encrypt(KeyG, hash(keyword) + searchNo);
  console.log("Search number: ", searchNo, " - KeyW: ", KeyW);

  // Increase search number:
  searchNo = searchNo + 1; //new

  // Compute new KeyW with the increased search number
  var newKeyW = encrypt(KeyG, hash(keyword) + searchNo);
  console.log("Increased search number: ", searchNo, " - new KeyW: ", newKeyW);

  var newKeyW_ciphertext = JSON.parse(newKeyW).ct;
  console.log("newKeyW_ciphertext:", newKeyW_ciphertext);

  var arrayAddr = [];
  for (var i = 1; i <= fileNo; i++) {
    // file number is counted from 1
    newAddr = '"' + hash(newKeyW_ciphertext + i + "0") + '"';
    console.log("hash input:", newKeyW_ciphertext + i + "0");
    console.log("hash output (address):", newAddr);
    arrayAddr.push(newAddr);
  } //end for

  var data =
    '{ "KeyW" : ' +
    KeyW +
    ',"fileno" : ' +
    fileNo +
    ',"Lu" :[' +
    arrayAddr +
    '],"keyId":"' +
    keyid +
    '"}';
  console.log("Data sent to CSP:", data);

  hashChars = sseConfig.hash_length / 4; //number of chars of hash output: 64

  console.log(
    "Sent search request:",
    sseConfig.base_url_sse_server + "/api/v1/search/"
  );
  result = postRequest(
    sseConfig.base_url_sse_server + "/api/v1/search/",
    data,
    function (response) {
      return true;
    },
    (async_feat = false)
  ); // Send request to CSP

  console.log("Results from post request after returned:", result.responseJSON);
  retriveFileIDs(result.responseJSON);
  data = retrieveData(
    result.responseJSON,
    key,
    searchNo,
    searchNoUri,
    keyword,
    keyid
  );
  console.log("Results from retrieveData:", data);

  return data;
}

//Search data
//Input: data - json object of search content, KeyG, Kenc - symmetric keys
function search(data, KeyG, Kenc, keyid) {
  if (data == {} || KeyG == "" || Kenc == "" || keyid == "") {
    console.log("Lack of parameter of search function");
    return {};
  }
  console.log("json object:", data);
  var keyword = data["keyword"];
  if (keyword == undefined) {
    console.log("Invalid input file");
    return null;
  }
  console.log("keyword: ", keyword);
  var results = findKeyword(keyword, KeyG, Kenc, keyid);
  return results;
}

// offset: the amount of increase in No.Search
function computeListKeyW(Lhash, KeyG, LsearchNo, offset = 0) {
  //Compute list of KeyW
  var input, addr;
  var LkeyW = [];
  var length = Lhash.length;
  for (i = 0; i < length; i++) {
    //for each keyword
    // Compute the key
    w = Lhash[i];
    searchno = LsearchNo[i] + offset;
    if (searchno === undefined) {
      //if not found
      searchno = 0;
    }
    KeyW = encrypt(KeyG, w + searchno);
    console.log("- Hash of keyword:", w, " -Search number:", searchno);
    console.log("ciphertext:", KeyW);

    LkeyW.push(KeyW);
  }
  return LkeyW;
}

// offset = 0 if computeAddr without changing No.File, offset = 1 if computeAddr with No.File = No.File + 1
function computeAddr(Lhash, LkeyW, LfileNo, offset = 0) {
  var input, addr;
  var Laddr = [],
    L;
  var length = Lhash.length;

  for (i = 0; i < length; i++) {
    //for each keyword
    // Retrieve ciphertext value from the ciphertext object KeyW
    KeyW_ciphertext = JSON.parse(LkeyW[i]).ct;
    console.log("KeyW_ciphertext:", KeyW_ciphertext);

    fileno = LfileNo[i];
    if (fileno == undefined) {
      //if not found, i.e. completely new keyword --> (not yet) check if this step is necessary
      fileno = 0;
    }

    if (offset == 0) {
      //compute current addresses
      start = 1;
    } else {
      //compute new address
      fileno = fileno + 1;
      start = fileno;
    }
    console.log("New No.Files:", fileno);

    L = [];
    for (j = start; j <= fileno; j++) {
      // for each index from start to fileno. The loop works  in case offset=1, and does not work in case offset=0
      input = KeyW_ciphertext + j + "0";
      addr = hash(input);
      console.log("hash input to compute address:", input);
      console.log("Address:" + addr);
      L.push('"' + addr + '"');
    }
    console.log("length of list:", L.length);
    if (L.length != 0) {
      Laddr.push("[" + L + "]");
    }
  }
  return Laddr;
}

function encryptList(Lkeyword, Kenc) {
  var length = Lkeyword.length;

  var Lcipher = [];
  for (i = 0; i < length; i++) {
    //for each keyword
    c = encrypt(Kenc, Lkeyword[i]);
    Lcipher.push(c);
  }

  return Lcipher;
}

//offset: the amount of addition or subtraction from the current fileno
function updateFileNo(Lhash, LfileNoUri, LfileNo, offset, keyid) {
  var objects = "";
  var length = Lhash.length;

  var del = false; // if delete fileno or not
  if (offset < 0) {
    deleted_objects = "[";
    delete_searchno = "[";
  }

  var update = false; //if update an existed entry, or add new entry
  var new_fileno, w, fileno;

  for (i = 0; i < length; i++) {
    //loop over keywords
    fileno = LfileNo[i];
    new_fileno = fileno + offset;
    w = Lhash[i];
    if (new_fileno <= 0) {
      // Subtraction: If after update, there is no file containing the keyword
      console.log("Delete an entry in fileNo:", w);
      del = true;
      deleted_objects += '"' + LfileNoUri[i] + '",';
    } else if (fileno == 0) {
      //&& fileno+offset>0, Addition: if after update, there exists file containing the keyword
      update = true;
      console.log("Add new entry in fileNo:", w);
      objects +=
        '{ "w" : "' +
        w +
        '","fileno" : ' +
        new_fileno +
        ',"keyId":"' +
        keyid +
        '"},';
    } else {
      // Update an existed entry in fileno
      update = true;
      console.log("Update existed entry in fileNo:", w);
      objects +=
        '{ "w" : "' +
        w +
        '","fileno" : ' +
        new_fileno +
        ',"keyId":"' +
        keyid +
        '","resource_uri" : "' +
        LfileNoUri[i] +
        '"},';
    }
  }

  // remove the last comma (,) from objects
  if (update == true) objects = objects.slice(0, -1);
  console.log("objects in fileno:", objects);

  if (del == true) {
    // delete only, or both update and delete
    deleted_objects = deleted_objects.slice(0, -1) + "]";
    console.log("deleted_objects in fileno:", deleted_objects);
  } else deleted_objects = deleted_objects + "]";

  return [del, objects, deleted_objects];
}

// Lexisted is equal or subset of Lhash
function createFullList(Lhash, Lexisted_hash, Lfound) {
  console.log("createFullList function");
  console.log("Lhash:", Lhash);
  console.log("Lhash.length:", Lhash.length);

  var length = Lhash.length;

  // build list of every keyword
  Lfull = [];
  for (i = 0; i < length; i++) {
    //for each keyword
    idx = Lexisted_hash.indexOf(Lhash[i]); //find if Lhash[i] exists in Lexisted_hash
    found = Lfound[idx]; // retrieve search no/ fileno of Lhash[i] (if existed)
    console.log("index of keyword in the found list:", idx);
    if (found == undefined) {
      //if not found
      found = 0;
    }
    console.log("found number is:", found);
    Lfull.push(found);
  }

  return Lfull;
}

//Update data:
// Data = { att1:[current_value,new_value], att2:[current_value,new_value] }
function updateData(data, file_id, sharedKey, Kenc, keyid, callback) {
  if (
    data == {} ||
    file_id == "" ||
    sharedKey == "" ||
    Kenc == "" ||
    keyid == ""
  ) {
    console.log("Lack of parameter of updateData function");
    return false;
  }

  // Based on {att:current_value}, request for No.Files, No.Search
  console.log("Updating data");
  console.log("key id:", keyid);
  var keys = Object.keys(data);
  console.log("key:", keys);
  var length = keys.length; // number of update fields
  var values = Object.values(data);
  console.log("values:", values);

  Lcurrent_value = [];
  Lnew_value = [];
  Lcurrent_hash = [];
  Lnew_hash = [];

  var KeyG = computeKeyG(sharedKey);
  var key = hash(Kenc);

  for (i = 0; i < length; i++) {
    current_value = keys[i] + "|" + values[i][0];
    new_value = keys[i] + "|" + values[i][1];
    console.log("current value:", current_value, " - new value:", new_value);
    Lcurrent_value.push(current_value);
    Lcurrent_hash.push(hash(current_value));
    Lnew_value.push(new_value);
    Lnew_hash.push(hash(new_value));
  }

  console.log("List of current values:", Lcurrent_value);
  console.log("List of hashes:", Lcurrent_hash);

  console.log("List of new values:", Lnew_value);
  console.log("List of new hashes:", Lnew_hash);

  // Get file number
  Lcurrent_fileNo = [];
  Lcurrent_fileNoUri = [];
  current_listW = [];
  [Lcurrent_fileNo, Lcurrent_fileNoUri, current_listW] = getMultiFileOrSearchNo(
    "fileno",
    Lcurrent_hash,
    keyid
  );

  if (Lcurrent_fileNo.length < length) {
    //at least 1 keyword is not found in No.Files
    console.log("At least one of update field does not exist in database");
    return false;
  }

  console.log("Lfileno of current keywords:", Lcurrent_fileNo);

  // Get search number
  Lall_found_searchNo = [];
  Lall_searchNoUri = [];
  all_tempListWord = [];
  Lall_hash = Lcurrent_hash.concat(Lnew_hash); //combine Lcurrent_hash and Lnew_hash
  [
    Lall_found_searchNo,
    Lall_searchNoUri,
    all_tempListWord,
  ] = getMultiFileOrSearchNo("searchno", Lall_hash, keyid);
  console.log("Lall_found_searchNo:", Lall_found_searchNo);
  console.log("all_tempListWord:", all_tempListWord);
  console.log("Lcurrent_hash:", Lcurrent_hash);

  // get the full list of search no of current keywords, which invole keywords with no search = 0
  // (not yet) to be improved: compare length of 2 list before calling function
  Lcurrent_searchNo = createFullList(
    Lcurrent_hash,
    all_tempListWord,
    Lall_found_searchNo
  );
  console.log("Lcurrent_searchNo:", Lcurrent_searchNo);

  Lcurrent_keyW = computeListKeyW(Lcurrent_hash, KeyG, Lcurrent_searchNo); // compute current list of KeyW
  Ltemp_keyW = computeListKeyW(Lcurrent_hash, KeyG, Lcurrent_searchNo, 1); // compute list of KeyW with searchno = searchno + 1
  console.log("List of current KeyW lists:", Lcurrent_keyW);
  console.log("List of temp KeyW lists:", Ltemp_keyW);

  Ltemp_addr = computeAddr(Lcurrent_hash, Ltemp_keyW, Lcurrent_fileNo); // compute temp addresses
  console.log("List of temp address:", Ltemp_addr);
  console.log("temp length, key length:", Ltemp_addr.length, length);

  // Get file no of the new keywords
  Lnew_fileNo = [];
  Lnew_fileNoUri = [];
  new_listW = [];
  [Lnew_found_fileNo, Lnew_fileNoUri, new_listW] = getMultiFileOrSearchNo(
    "fileno",
    Lnew_hash,
    keyid
  );

  // Build full list of No.File of every keyword
  Lnew_fileNo = createFullList(Lnew_hash, new_listW, Lnew_found_fileNo);
  console.log("Lfileno of current keywords:", Lnew_fileNo);

  // get the full list of search no of new keywords, which invole keywords with no search = 0
  Lnew_searchNo = createFullList(
    Lnew_hash,
    all_tempListWord,
    Lall_found_searchNo
  );

  Lnew_keyW = computeListKeyW(Lnew_hash, KeyG, Lnew_searchNo); // compute new list of KeyW
  Lnew_addr = computeAddr(Lnew_hash, Lnew_keyW, Lnew_fileNo, 1); // compute new addresses with No.Files = No.Files + 1
  console.log("List of new KeyW:", Lnew_keyW);
  console.log("List of new address lists:", Lnew_addr);

  // Encrypt new values
  Lcurrent_cipher = encryptList(Lcurrent_value, key);
  Lnew_cipher = encryptList(Lnew_value, key);

  var data =
    '{"file_id":"' +
    file_id +
    '","LkeyW" :[' +
    Lcurrent_keyW +
    '],"Lfileno" :[' +
    Lcurrent_fileNo +
    '],"Ltemp" :[' +
    Ltemp_addr +
    '],"Lnew" :[' +
    Lnew_addr +
    '],"Lcurrentcipher" :[' +
    Lcurrent_cipher +
    '],"Lnewcipher" :[' +
    Lnew_cipher +
    '],"keyId":"' +
    keyid +
    '"}';
  console.log("Data sent to CSP:", data);

  console.log(
    "Sent update request:",
    sseConfig.base_url_sse_server + "/api/v1/update/"
  );
  result = postRequest(
    sseConfig.base_url_sse_server + "/api/v1/update/",
    data,
    function (response) {
      return true;
    },
    (async_feat = false)
  ); // Send request to CSP

  console.log("Response of update:", result.status);

  if (result.status == HTTP_CODE_CREATED) {
    //Update No.Files at TA
    // PATCH request (if a keyword is new, create fileNo in TA) and PUT request (if a keyword is existed, update fileNo in TA)
    console.log("Decrease current No.Files at TA");
    var current_del,
      current_objects,
      current_deleted_objects,
      delete_current_searchno;

    // not yet: check if remove delete_current_searchno is fine or not
    [
      current_del,
      current_objects,
      current_deleted_objects,
      delete_current_searchno,
    ] = updateFileNo(
      Lcurrent_hash,
      Lcurrent_fileNoUri,
      Lcurrent_fileNo,
      -1,
      keyid
    );

    console.log("Increase new No.Files at TA");
    var new_del, new_objects, new_deleted_objects, delete_new_searchno;
    // not yet: check if remove delete_new_searchno is fine or not
    [
      new_del,
      new_objects,
      new_deleted_objects,
      delete_new_searchno,
    ] = updateFileNo(Lnew_hash, Lnew_fileNoUri, Lnew_fileNo, 1, keyid);

    // update No.Files
    objects = '"objects":[';
    if (current_objects != []) objects += current_objects;
    if (new_objects != []) if (current_objects != []) objects += ",";
    objects += new_objects;
    objects += "]";

    if (current_del == true)
      //if needs to delete
      data =
        "{" + objects + ',"deleted_objects":' + current_deleted_objects + "}";
    // add and update only
    else data = "{" + objects + "}";

    console.log("data sent to update fileno:", data);
    patchRequest(sseConfig.base_url_ta + "/api/v1/fileno/", data, callback);
  }
  return true;
}

//Delete data
function deleteData(file_id, sharedKey, Kenc, keyid, callback) {
  if (file_id == "" || sharedKey == "" || Kenc == "" || keyid == "") {
    console.log("Lack of parameter of deleteData function");
    return false;
  }
  // Send GET request to CSP to retrieve ciphertext of data belonging to file_id
  var obj = getRequest(
    sseConfig.base_url_sse_server +
      "/api/v1/ciphertext/?limit=0&jsonId=" +
      file_id +
      "&keyId=" +
      keyid
  ); //limit=0 allows to get all items
  console.log("response:", obj);
  var length = obj.meta.total_count;
  if (length == 0) {
    console.log("File_id and/ or key id does not exist");
    return false;
  } else {
    console.log("File_id and key id exist");
    var KeyG = computeKeyG(sharedKey);
    console.log("KeyG:", KeyG);
    var key = hash(Kenc);

    // Decrypt data
    var pt = decryptData(obj.objects, key);

    // Send GET request to TA to retrieve fileno
    // combine multiple hashed keywords into a list, separated by comma
    var Lw = []; //list of hashed keywords
    var Lcipher = [];

    // retrieve data from Map table by file_id
    var objMap = getRequest(
      sseConfig.base_url_sse_server +
        "/api/v1/map/?limit=0&value=" +
        file_id +
        "&keyId=" +
        keyid
    );
    console.log("objects in map table:", objMap);
    for (i = 0; i < length; i++) {
      w = pt[i];
      Lw.push(hash(w));
      Lcipher.push('"' + obj.objects[i].data + '"');
    }

    console.log("list of hashed keywords:", Lw);

    // Retrieve list of file number
    [LfileNo, LfileNoUri, listW] = getMultiFileOrSearchNo("fileno", Lw, keyid);
    console.log("keyword string input:", Lw);
    console.log("List of file numbers: ", LfileNo);
    console.log("List of Url:", LfileNoUri);
    console.log("List of retrieved keywords:", listW);

    var listFileNo;
    if (Lw.length > listW.length)
      listFileNo = createFullList(Lw, listW, LfileNo);
    else listFileNo = LfileNo;

    console.log("full list of file no of keywords:", listFileNo);
    // Retrieve search number

    [LsearchNo, LsearchNoUri, tempListWord] = getMultiFileOrSearchNo(
      "searchno",
      Lw,
      keyid
    ); //"tempListWord" can be empty if all keywords has been never searched

    console.log("Search numbers: ", LsearchNo);
    console.log("Urls: ", LsearchNoUri);
    console.log("list of words in searchno:", tempListWord);

    var listSearchNo;
    if (Lw.length > tempListWord.length)
      listSearchNo = createFullList(Lw, tempListWord, LsearchNo);
    else listSearchNo = LsearchNo;
    console.log("full list of search no of keywords:", listSearchNo);

    LkeyW = computeListKeyW(Lw, KeyG, listSearchNo); // compute list of KeyW with searchno = searchno + 1
    Ltemp_keyW = computeListKeyW(Lw, KeyG, listSearchNo, 1); // compute list of KeyW with searchno = searchno + 1

    console.log("List of KeyW lists:", LkeyW);

    Laddr = computeAddr(Lw, Ltemp_keyW, listFileNo); // compute addresses
    console.log("List of address:", Laddr);

    var data =
      '{"file_id":"' +
      file_id +
      '","LkeyW" :[' +
      LkeyW +
      '],"Lfileno" :[' +
      LfileNo +
      '],"Ltemp" :[' +
      Laddr +
      '],"Lcipher" :[' +
      Lcipher +
      '],"keyId":"' +
      keyid +
      '"}';
    console.log("Data sent to CSP:", data);

    console.log(
      "Sent delete request:",
      sseConfig.base_url_sse_server + "/api/v1/delete/"
    );
    result = postRequest(
      sseConfig.base_url_sse_server + "/api/v1/delete/",
      data,
      function (response) {
        return true;
      },
      (async_feat = false)
    ); // Send request to CSP

    // Send PATCH request to TA to update/delete entries in fileno table
    var current_del, current_objects, current_deleted_objects;
    [current_del, current_objects, current_deleted_objects] = updateFileNo(
      Lw,
      LfileNoUri,
      LfileNo,
      -1,
      keyid
    );

    console.log("deleted objects in fileno table:", current_deleted_objects);
    // update No.Files
    var objects = '"objects":[';
    if (current_objects != []) objects += current_objects;
    objects += "]";

    if (current_deleted_objects != [])
      //if needs to delete
      data =
        "{" + objects + ',"deleted_objects":' + current_deleted_objects + "}";
    // add and update only
    else data = "{" + objects + "}";

    console.log("data sent to update fileno:", data);
    patchRequest(sseConfig.base_url_ta + "/api/v1/fileno/", data, callback);
  }
  return true;
}

// Compute KeyG from passphrase
function computeKeyG(pwdphrase) {
  return hash(pwdphrase + "keyg");
}
// Upload hash of key
function uploadKeyG(pwdphrase, keyid) {
  if (pwdphrase == "" || keyid == "") {
    console.log("Lack of passphrase or keyid");
    return false;
  }
  console.log("passphrase to compute keyg:", pwdphrase);
  var keyg = computeKeyG(pwdphrase);
  var jsonData = '{ "key" : "' + keyg + '","keyId":"' + keyid + '"}';
  console.log("uploaded KeyG:", keyg);
  postRequest(
    sseConfig.base_url_ta + "/api/v1/key/",
    jsonData,
    undefined,
    (async_feat = false)
  );
  return true;
}

function encryptBlob(blobData, ftype, Kenc) {
  return function (resolve) {
    var reader = new FileReader();

    reader.onload = function (e) {
      var imageData = new Uint8Array(e.target.result);
      console.log("Blob content:", imageData);
      var imageString = sjcl.codec.base64.fromBits(imageData); // convert byte array to base64 string
      console.log("image plaintext in string:", imageString);

      var imagecipher = encrypt(Kenc, imageString); //encrypt

      var objJsonStr = JSON.stringify(imagecipher); // json -> string
      console.log("cipher image in string:", objJsonStr);
      var objJsonB64 = btoa(objJsonStr); // string -> base64
      console.log("cipher image in base64:", objJsonB64);
      var temp = sjcl.codec.base64.toBits(objJsonB64); // base64 -> bits
      console.log("number of bits:", temp.length);
      console.log("bit array:", sjcl.codec.base64.toBits(objJsonB64));

      var cipherByte = new Uint8Array(
        fromBitArrayCodec(sjcl.codec.base64.toBits(objJsonB64))
      );
      console.log("cipher image in byte:", cipherByte);
      console.log("number of bytes:", cipherByte.length);
      var cipherBlob = new Blob([cipherByte], { type: ftype });
      resolve(cipherBlob);
    };
    reader.readAsArrayBuffer(blobData);
  };
}

//https://stackoverflow.com/questions/40848757/cryptojs-decrypt-an-encrypted-file
function getCipherInfo(ciphers) {
  const sigBytesMap = [];
  const sigBytes = ciphers.reduce((tmp, cipher) => {
    tmp += cipher.sigBytes || cipher.ciphertext.sigBytes;
    sigBytesMap.push(tmp);
    return tmp;
  }, 0);

  const words = ciphers.reduce((tmp, cipher) => {
    return tmp.concat(cipher.words || cipher.ciphertext.words);
  }, []);

  return { sigBytes, sigBytesMap, words };
}

function getBlob(sigBytes, words) {
  const bytes = new Uint8Array(sigBytes);
  for (var i = 0; i < sigBytes; i++) {
    const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    bytes[i] = byte;
  }

  return new Blob([new Uint8Array(bytes)]);
}

// Approach: File -> divide into chunks -> encrypt each chunk -> upload -> (loop) -> until finish
function encryptProgressBlob(blobData, ftype, Kenc) {
  console.log("Progress Encrypt Blob");
  console.log("blob content:", blobData);
  return function (resolve) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var imageData = new Uint8Array(e.target.result);
      console.log("Blob content:", imageData);

      h = sjcl.codec.hex;
      var iv = [-16119071, -276457509, 2001133657, 474172955]; //sjcl.random.randomWords(4, 0);
      console.log("iv:", iv);
      //iv = h.toBits(sseConfig.iv);
      var keyString = "2d73c1dd2f6a3c981afc7c0d49d7b58f";
      console.log("keystring:", keyString);
      var key = sjcl.codec.base64.toBits(keyString);
      aes = new sjcl.cipher.aes(key);
      console.log("key:", key);
      //adata = "";
      var enc = sjcl.mode.ocb2progressive.createEncryptor(aes, iv);

      var result = [];
      var sliceSizeRange = 1024 * 32; //1024*1024; // size of 1 slice/ chunk for encryption (in uint8 items)
      var slice = [0, sliceSizeRange]; //data will be sliced/ chunked/ read between slice[0] and slice[1]
      var count = 0;
      console.log("length of data:", imageData.length);

      var fragment = 30; //number of chunks to be packed in 1 upload

      var cipherpart, outputname;
      var idx = 0;
      var tb = [];

      while (slice[0] < imageData.length) {
        result = result.concat(
          enc.process(toBitArrayCodec(imageData.slice(slice[0], slice[1])))
        );
        //result = result.concat(enc.process(sjcl.codec.bytes.toBits(imageData.slice(slice[0], slice[1]))));
        slice[0] = slice[1];
        slice[1] = slice[0] + sliceSizeRange;
        if (slice[1] > imageData.length) slice[1] = imageData.length;

        count = count + 1;

        if (count % fragment == 0) {
          //upload each part of #fragment chunks/ slices.
          console.log("upload part:", count);
          console.log("ciphertext type:", typeof result);

          tb[idx] = result;
          console.log("tb[idx]:", tb[idx]);
          idx = idx + 1;

          cipherpart = new Blob([result], { type: ftype }); //upload as 1 whole part
          result = [];
          outputname = "part" + idx;
          console.log("blob cipher:", cipherpart);
          uploadMinio(cipherpart, outputname);
        }
      }
      result = result.concat(enc.finalize());
      console.log("Last part ciphertext:", result);
      tb[idx] = result;
      console.log("tb[idx]:", tb[idx]);
      idx = idx + 1;

      cipherpart = new Blob([result], { type: ftype });
      outputname = "final_part";
      uploadMinio(cipherpart, outputname);

      //decryption - for testing only
      /*
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
					uploadMinio(imageDecryptBlob,"plaintext" + idx + ".mp4");
		        }
		        dresult = dresult.concat(dec.finalize());
		        console.log("plaintext:",dresult)
		        imageByte = new Uint8Array(dresult); // create byte array from base64 string
				console.log("plaintext in bytes:",imageByte);
		
				imageDecryptBlob = new Blob([imageByte], { type: ftype });//{ type: ftype });
				uploadMinio(imageDecryptBlob,"plaintext_final.mp4");
				
				console.log("complete decrypting and sending to minio");
		    } catch (e) {
		        console.log("Error:" + e);
		    }*/

      //var cipherBlob = new Blob([result], { type: ftype });
      resolve(cipherpart);
    };
    reader.readAsArrayBuffer(blobData);
  };
}

function downloadWithPresignUrl(presignedUrl, fname, callback) {
  $.ajax({
    url: presignedUrl, // the presigned URL
    type: "GET",
    xhrFields: {
      responseType: "blob", //download as blob data
    },
    success: function (data, status) {
      //console.log("data:",data)
      callback(data, fname); //decrypt data
      return true;
    },
    error: function (erro) {
      console.error("Download from Minio Error");
    },
  });
}

function getPresignUrl(fname) {
  url = sseConfig.base_url_sse_server + "/api/v1/presign/" + fname + "/";
  console.log("Rest API to get presign url:", url);
  ret = "";
  $.ajax({
    url: url, // the rest api URL
    type: "GET",
    async: false,
    success: function (response, status) {
      console.log("presignUrl", response.url);
      ret = response.url;
    },
    error: function (erro) {
      console.error("Download from Minio Error");
    },
  });
  return ret;
}

function putPresignUrl(fname) {
  url = sseConfig.base_url_sse_server + "/api/v1/presign/";
  console.log("Rest API to put presign url:", url);
  console.log("filename:", fname);
  ret = "";
  var data = {
    fname: fname,
  };
  $.ajax({
    url: url, // the rest api URL
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(data),
    async: false,
    success: function (response, status) {
      console.log("presignUrl", response.url);
      ret = response.url;
    },
    error: function (erro) {
      console.error("Put presign url from Minio Error");
      console.error(erro);
    },
  });
  return ret;
}

//Upload file to Minio
//Input: - fname: filename, - blob: data to upload
function uploadMinio(blob, fname, callback = undefined) {
  var presigned_url = putPresignUrl(fname); // request for a presigned url
  //console.log("put presign url:",presigned_url)
  //uploadToMinio(url,blob) // upload to Minio

  $.ajax({
    url: presigned_url,
    type: "PUT",
    processData: false,
    data: blob,
    async: false,
    success: function (data) {
      if (callback != undefined) {
        callback(true);
      }
    },
    error: function (erro) {
      console.error("Put Request Error");
    },
  });
}

//Encrypt blob data and upload to Minio along with its searchable metadata (json format)
function encryptUploadSearchableBlob(
  blob,
  fname,
  jsonObj,
  file_id,
  KeyG,
  Kenc,
  callback = undefined
) {
  //append filename to metadata
  jsonObj.filename = fname;
  console.log("metadata after appending filename:{}", jsonObj);
  encryptUploadBlob(blob, fname, Kenc);
  uploadData(jsonObj, file_id, KeyG, Kenc);
}
//Encrypt blob data and upload to Minio
function encryptUploadBlob(blob, fname, Kenc, callback = undefined) {
  var ftype = blob.type;
  //  var outputname = fname.split(".")[0];// + "_encrypted";
  var outputname = fname;
  var promise = new Promise(encryptBlob(blob, ftype, Kenc));

  // Wait for promise to be resolved, or log error.
  promise
    .then(function (cipherBlob) {
      console.log("Completed encrypting blob. Now send data to server.");
      console.log(cipherBlob);
      uploadMinio(cipherBlob, outputname, callback);
      //return true;//for jest
    })
    .catch(function (err) {
      console.log("Error: ", err);
    });
  return promise;
}

//Encrypt blob data and upload to Minio
function encryptProgressUploadBlob(blob, fname, Kenc, callback = undefined) {
  var ftype = blob.type;
  console.log("blob type:", ftype);

  var outputname = fname;
  var promise = new Promise(encryptProgressBlob(blob, ftype, Kenc));

  // Wait for promise to be resolved, or log error.
  promise
    .then(function (cipherBlob) {
      console.log("Completed encrypting blob. Now send data to server.");
    })
    .catch(function (err) {
      console.log("Error: ", err);
    });
  return promise;
}

//Download file from Minio, decrypt and save it to local host
//Input: - fname: filename, - callback: function to decrypt and save file
//function downloadMinio(fname,callback){
function downloadDecryptBlob(fname, Kenc, callback = undefined) {
  console.log("Download blob");
  var presigned_url = getPresignUrl(fname); // request for a presigned url
  //downloadWithPresignUrl(url,fname,callback); // download the file and decrypt it with a callback function, which is "handleBlobDecrypt" function
  $.ajax({
    url: presigned_url, // the presigned URL
    type: "GET",
    xhrFields: {
      responseType: "blob", //download as blob data
    },
    success: function (data, status) {
      //console.log("data:",data)
      //callback(data,fname) //decrypt data
      console.log("Decrypt and save blob");
      decryptSaveBlob(data, fname, Kenc, callback); //decrypt data
      // return true;
    },
    error: function (erro) {
      console.error("Download from Minio Error");
      console.error(erro);
    },
  });
}

function readFileAsync(file) {
  return new Promise((resolve, reject) => {
    var fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result);
    };
    fr.readAsText(file);
  });
}

//Decrypt blob data
//Input: - data: blob data, - fname: file name. Output: - save file to local host
function decryptSaveBlob(blob, fname, Kenc, callback = undefined) {
  var outputname = fname; //fname.split(".")[0];// + "_decrypted";
  console.log("Filename to be saved: " + outputname);
  var ftype = blob.type; //identify filetype from blob

  var promise = new Promise(decryptBlob(blob, ftype, Kenc));
  //var promise = decryptBlob(blob,ftype,Kenc);

  promise.then((plainBlob) => {
    console.log("Save file to disk");
    saveBlob(plainBlob, outputname);
    if (callback != undefined) {
      callback(true); // for jest
    }
  });
  return promise;
}

function decryptProgressSaveBlob(blob, fname, Kenc, callback = undefined) {
  var outputname = fname; //fname.split(".")[0];// + "_decrypted";
  console.log("Filename to be saved: " + outputname);
  var ftype = blob.type; //identify filetype from blob

  var promise = new Promise(decryptProgressBlob(blob, ftype, Kenc));
  //var promise = decryptBlob(blob,ftype,Kenc);

  promise.then((plainBlob) => {
    console.log("Save file to disk");
    saveBlob(plainBlob, outputname);
    if (callback != undefined) {
      callback(true); // for jest
    }
  });

  return promise;
}

function decryptBlob(blobCipher, ftype, Kenc) {
  return function (resolve) {
    var reader = new FileReader();
    console.log("Decrypt blob");
    reader.onload = function (e) {
      var imagecipher = new Uint8Array(e.target.result);
      console.log("input array:", imagecipher);

      var bitarray = toBitArrayCodec(imagecipher);
      console.log("bit array:", bitarray);

      var imageBase = sjcl.codec.base64.fromBits(bitarray); // byte array->base64
      console.log("image ciphertext in base64:", imageBase);
      var imageString = atob(imageBase); //base64 -> string
      console.log("image ciphertext in string:", imageString);
      var imageJson = JSON.parse(imageString); //string->json
      console.log("ciphertext in json:", imageJson);

      var imagept = decrypt(Kenc, imageJson);
      console.log("decrypt image in string:", imagept);

      var imageByte = new Uint8Array(sjcl.codec.base64.toBits(imagept)); // create byte array from base64 string
      console.log("plaintext in bytes:", imageByte);

      var imageDecryptBlob = new Blob([imageByte], { type: ftype });
      resolve(imageDecryptBlob);
    };
    reader.readAsArrayBuffer(blobCipher);
  };
}

function downloadProgressDecryptBlob(fname, Kenc, callback = undefined) {
  console.log("Download blob");
  var n = 900; //number of parts except final_part
  var fragments = [];
  var i;
  for (i = 1; i <= n; i++) {
    fragments.push("part" + i);
  }
  fragments.push("final_part");
  console.log("file names:", fragments);

  try {
    h = sjcl.codec.hex;
    var iv = [-16119071, -276457509, 2001133657, 474172955];
    var keyString = "2d73c1dd2f6a3c981afc7c0d49d7b58f";
    var key = sjcl.codec.base64.toBits(keyString);
    aes = new sjcl.cipher.aes(key);
    var dec = sjcl.mode.ocb2progressive.createDecryptor(aes, iv);
    var dresult;
    var ftype = "video/mp4"; //"video/mp4";//"application/pdf";//"image/jpeg";
    var fext = ".mp4"; //".pdf";//".mp4";//".pdf";//".jpg";

    for (var i = 0; i < fragments.length; i++) {
      var presigned_url = getPresignUrl(fragments[i]);
      var h = sjcl.codec.bytes;
      $.ajax({
        url: presigned_url,
        type: "GET",
        async: false,
        success: function (blob, status) {
          console.log("blob:", blob);
          var imageJson = JSON.parse("[" + blob + "]"); //string->json
          console.log("ciphertext in json:", imageJson);

          dresult = h.fromBits(dec.process(imageJson));
          if (i == fragments.length - 1) {
            dresult = dresult.concat(dec.finalize());
          }

          imageByte = new Uint8Array(dresult); // create byte array from base64 string
          console.log("plaintext in bytes:", imageByte);

          console.log("create blob");
          imageDecryptBlob = new Blob([imageByte], { type: ftype }); //, { type: "image/jpeg" } );
          console.log("saving file");

          saveBlob(imageDecryptBlob, "plaintext" + i + fext);

          dresult = [];
        },
        error: function (erro) {
          console.log("Download from Minio Error");
          console.log(erro);
        },
      });
    }
  } catch (e) {
    console.log("Error:" + e);
  }
}

function decryptProgressBlob(blobCipher, Kenc, dec, name) {
  return function (resolve) {
    var reader = new FileReader();
    console.log("Decrypt blob");
    reader.onload = function (e) {
      var imagecipher = new Uint8Array(e.target.result);
      console.log("input array:", imagecipher);

      var bitarray = toBitArrayCodec(imagecipher);
      console.log("bit array:", bitarray);

      var imageBase = sjcl.codec.base64.fromBits(bitarray); // byte array->base64
      console.log("image ciphertext in base64:", imageBase);
      var imageString = atob(imageBase); //base64 -> string
      console.log("image ciphertext in string:", imageString);
      var imageJson = JSON.parse("[" + imageString + "]"); //string->json
      console.log("ciphertext in json:", imageJson);

      try {
        // var dec = sjcl.mode.ocb2progressive.createDecryptor(aes, iv);
        var dresult = fromBitArrayCodec(dec.process(imageJson));
        console.log("dresult:", dresult);
      } catch (e) {
        console.log("Error:" + e);
      }

      resolve({ name: name, result: dresult });
    };
    reader.readAsArrayBuffer(blobCipher);
  };
}

//referenced from internet
/** Convert from an array of bytes to a bitArray. */
function toBitArrayCodec(bytes) {
  var out = [],
    i,
    tmp = 0;
  for (i = 0; i < bytes.length; i++) {
    tmp = (tmp << 8) | bytes[i];
    if ((i & 3) === 3) {
      out.push(tmp);
      tmp = 0;
    }
  }
  if (i & 3) {
    out.push(sjcl.bitArray.partial(8 * (i & 3), tmp));
  }
  return out;
}

//referenced from internet
/** Convert from a bitArray to an array of bytes. */
function fromBitArrayCodec(arr) {
  var out = [],
    bl = sjcl.bitArray.bitLength(arr),
    i,
    tmp;
  for (i = 0; i < bl / 8; i++) {
    if ((i & 3) === 0) {
      tmp = arr[i / 4];
    }
    out.push(tmp >>> 24);
    tmp <<= 8;
  }
  return out;
}

//referenced from internet
//save file to localhost
function saveBlob(blob, fileName) {
  console.log("save file");
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  console.log("click");
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function sleep(milliseconds) {
  let timeStart = new Date().getTime();
  while (true) {
    let elapsedTime = new Date().getTime() - timeStart;
    if (elapsedTime > milliseconds) {
      break;
    }
  }
}

function handleProgressBlob(fname, ftype, Kenc) {
  var reader = new FileReader();
  reader.onload = function (event) {
    console.log("data:", event.target.result);
    var blobData = new Blob([new Uint8Array(event.target.result)], {
      type: ftype,
    });
    encryptProgressUploadBlob(blobData, fname, Kenc);
  };
  reader.readAsArrayBuffer(fname);
}
