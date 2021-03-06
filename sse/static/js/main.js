/// APPLICATION CONFIGURATION
var appConfig={
	 'used_fields' : 2, // number of active fields in json_form.html
	 'all_fields' : 24 // total number of fields in json_form.html
}

/// APPLICATION CONFIGURATION - End

/// HANDLERS
// Handle event of data upload data
function handleFileLoad(event){
	  var Kenc = $("#passphrase1").val()

	  var KeyG = $("#passphrase1b").val();
	  console.log("encryption passphrase/key:",Kenc,"verification passphrase/key:",KeyG);
		
      
	  var file_id = $("#fileid1").val()
	  var keyid = $("#keyid1").val()
	  
	  var token = $("#token1").val()
	  console.log("token:",token)
	  
	  if(file_id==""){
		  file_id=hash(Math.random().toString(36).substring(7)); // generate unique file_id. This should be changed in production
	  }
	  console.log("file id:",file_id);
	  var jsonObj = JSON.parse(event.target.result); //parse json file content into json objects
      
      var st_date = new Date();
      var st_time = st_date.getTime();
      
      var iskey;
      if($('#pwd1').is(":checked"))
    	  iskey = false;
      else
    	  iskey = true;
      console.log("Is it a key? ",iskey)
      
	  var ret = uploadData(jsonObj,file_id,KeyG,Kenc,keyid,iskey,token); // Upload data to CSP
	  
      var end_date = new Date();
      var end_time = end_date.getTime();
      var diff = end_time - st_time;
      
	  if(ret==false){
		  message = "Existed file id, or the two provide passphrases/keys are the same."
	  }
	  else{
		  message = "Submit process completed."
	  }
	
      console.log(message);
      $('#notify').html("<div class='alert-primary alert'>" + message + "</div>");
      $('#exetime').html("<div class='alert-primary alert'> Exec time:" +  diff + " </div>");
}

// Handle search data event
function handleSearchFileLoad(event){
	var Kenc = $("#passphrase2").val();
	
	var KeyG = $("#passphrase2b").val();
	console.log("encryption passphrase/key:",Kenc,"verification passphrase/key:",KeyG);
	
	var keyid = $("#keyid2").val()
	
	var jsonObj = JSON.parse(event.target.result);
	
	var st_date = new Date();
    var st_time = st_date.getTime();
 
	var iskey;
	if($('#pwd2').is(":checked"))
		iskey = false;
	else
		iskey = true;
	console.log("Is it a key? ",iskey)
	
	var fe;
	if($('#fe').is(":checked"))
		isfe = true;
	else
		isfe = false;
	console.log("Is the search for functional encryption (FE)? ",isfe)
	
	var token = $("#token2").val()
    console.log("token:",token)
	  
	var results=search(jsonObj,KeyG,Kenc,keyid,iskey,isfe,token);
	
	if(results==null){
		message = "Invalid input file"
	}
	else
		message = results["count"]
	
    var end_date = new Date();
    var end_time = end_date.getTime();
    var diff = end_time - st_time;
    
	console.log("Found results:",results);
	
	$('#result').empty();
	$('#searchtime').empty();
	$('#result').append("<div class='alert-primary alert'> Found " + message + " results </div>");
	$('#searchtime').html("<div class='alert-primary alert'> Search time: " +  diff + " </div>");
}

// Include sse.js
/*
function dynamicallyLoadScript(url) {
    var script = document.createElement("script"); //Make a script DOM node
    script.src = url; //Set it's src to the provided URL
    document.head.appendChild(script); //Add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}*/

//Handle update data event
function handleUpdateFileLoad(event){
	var Kenc = $("#passphrase3").val();
	
	var KeyG = $("#passphrase3b").val();
	console.log("encryption passphrase/key:",Kenc,"verification passphrase/key:",KeyG);
	
	
	var keyid =$("#keyid3").val();
	
	var jsonObj = JSON.parse(event.target.result);
	
	var st_date = new Date();
    var st_time = st_date.getTime();
    var file_id = $("#fileid2").val() 
    if(file_id==""||keyid==""){
    	message = "Please provide file id and/ or key id"
	}
    else{
		var iskey;
		if($('#pwd3').is(":checked"))
			iskey = false;
		else
			iskey = true;
		console.log("Is it a key? ",iskey)
		
		var token = $("#token3").val()
		console.log("token:",token)
    
    	var result=updateData(jsonObj,file_id,KeyG,Kenc,keyid,iskey,token);
    	console.log("Update result:",result)
    	if(result==true){
    		message = "Updated"
    	}
    	else
    		message = "At least one update field/ value does not exist. Halt update."
    }
    var end_date = new Date();
    var end_time = end_date.getTime();
    var diff = end_time - st_time;
	
	$('#update').empty();
	$('#updatetime').empty();
	$('#update').append("<div class='alert-primary alert'>" + message+ "</div>");
	$('#updatetime').html("<div class='alert-primary alert'> Update time: " +  diff + " </div>");
	
}

//Handle update data event
function handleDeleteFile(){
	var Kenc = $("#passphrase4").val();
	
	var KeyG = $("#passphrase4b").val();
	console.log("encryption passphrase/key:",Kenc,"verification passphrase/key:",KeyG);
	
	
	var st_date = new Date();
    var st_time = st_date.getTime();
    var file_id = $("#fileid3").val() 
    var keyid = $("#keyid4").val() 
    if(file_id=="" || keyid==""){
    	message = "Please provide file id and key id"
 	}
    else{
    	console.log("Delete data")
		var iskey;
		if($('#pwd4').is(":checked"))
			iskey = false
		else
			iskey = true
		console.log("Is it a key? ",iskey)
		
		var token = $("#token4").val()
		console.log("token:",token)
		
    	var result=deleteData(file_id,KeyG,Kenc,keyid,iskey,token);
    	console.log("Delete result:",result)
    	if(result==true){
    		message = "Deleted"
    	}
    	else
    		message = "There is some error."
    }
    var end_date = new Date();
    var end_time = end_date.getTime();
    var diff = end_time - st_time;
	
	$('#delete').empty();
	$('#deletetime').empty();
	$('#delete').append("<div class='alert-primary alert'>" + message+ "</div>");
	$('#deletetime').html("<div class='alert-primary alert'> Delete time: " +  diff + " </div>");
}

function handleProgressBlobDecrypt(fname,keyId){
	var Kenc = $("#passphrase6").val();
	var iskey ;
	if($('#pwd6').is(":checked"))
		iskey = false;
	else
		iskey = true;
	
	var token = $("#token6").val()
	console.log("token:",token)
	
	var st_date = new Date();
    var st_time = st_date.getTime();
    downloadProgressDecryptBlob(fname,Kenc,keyId,iskey,token);
    
    var end_date = new Date();
    var end_time = end_date.getTime();
    var diff = end_time - st_time;
}

function handleBlobProgressUpload(event){
	var Kenc = $("#passphrase5").val();
	var keyId = $("#keyid5").val();
	
	var st_date = new Date();
    var st_time = st_date.getTime();

    var fname = $("#filename").val();
    var ftype = $("#filetype").val();
   
    var outputname = fname.split(".")[0];// + "_encrypted";
    console.log("Filename: " + typeof  fname);
    console.log("Type: " +  ftype);
    

    var blobData = new Blob([new Uint8Array(event.target.result)], {type: ftype });
    
	var iskey ;
	if($('#pwd5').is(":checked"))
		iskey = false;
	else
		iskey = true;
    console.log("is it a key?:",iskey);
    
	var token = $("#token5").val()
	console.log("token:",token)
	
    encryptProgressUploadBlob(blobData,fname,Kenc,keyId,iskey,token);

    var end_date = new Date();
    var end_time = end_date.getTime();
    var diff = end_time - st_time;
}

function handleProgressBlobSSEUpload(jsonObj){
	return function(event){
		var Kenc = $("#passphrase7").val();
		
		var KeyG = $("#passphrase7b").val();
		console.log("encryption passphrase/key:",Kenc,"verification passphrase/key:",KeyG);
		
		var keyId = $("#keyid7").val();
		
		var st_date = new Date();
	    var st_time = st_date.getTime();
	
	    var fname = $("#filename").val();
	    var ftype = $("#filetype").val();
	    var outputname = fname.split(".")[0];// + "_encrypted";
	    console.log("Filename: " + typeof  fname);
	    console.log("Type: " +  ftype);
		
		if($('#pwd7').is(":checked"))
			iskey = false;
		else
			iskey = true;
		console.log("Is it a key? ",iskey)
		
		var token = $("#token7").val()
		console.log("token:",token)
		
	    var blobData = new Blob([new Uint8Array(event.target.result)], {type: ftype });
	    
	    encryptProgressUploadSearchableBlob(blobData,fname,jsonObj,fname,KeyG,Kenc,keyId,iskey,token);
	
	    var end_date = new Date();
	    var end_time = end_date.getTime();
	    var diff = end_time - st_time;
	}
}


/// HANDLERS - END

$(document).ready(
		function() {
			/*
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
				
				var data = $("#json-form").find("input[name!=csrfmiddlewaretoken]").serializeArray();//get all data, except the hidden value: "name":"csrfmiddlewaretoken"
				
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

			});//end btnSubmit
			
			/// SEARCH FOR PATIENT by form
			$('#btnSearch').click(function(){
				$('#result').empty();
				$('#result').html("<div class='alert-primary alert'> Searching </div>");
				
				// Get value of keyword from the search box and the radio box
				var selectVal = $("#searchBy  option:selected").val();
				var keyword = selectVal + "|" +  $("#keyword").val();
				
				var KeyG = appConfig.KeyG;	
				var Kenc = appConfig.key_encrypt;
				
				console.log("keyword for search", keyword);
				
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
			});//end btnSearch */
			
			// Send key to SSE TA
			$("#btnSendHashKey").click(function(){
				var iskey;
				if($('#pwd').is(":checked"))
					iskey = false;
				else
					iskey = true;
				console.log("Input is a key?:",iskey);
				
				console.log("Send key to SSE TA")
				$('#uploadkeyg').empty();
				var input = $("#passphrase").val()
				var key;
				if(iskey==true)
					key = input;
				else
					key = computeKey(input,true) // generate key to be shared with SSE TA
				
				var keyid = $("#keyid").val();
				var token = $("#token").val();
				uploadKeyG(key,keyid,token); // Upload key to SSE TA
				
				
				$('#passphrase').val("");
				$('#uploadkeyg').html("<div class='alert-primary alert'> Submitted </div>");
			});
			
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
				$('#notify').html("<div class='alert-primary alert'> Submitted </div>");
			});
			
			/// SEARCH FOR PATIENT by submitting json file
			$('#btnSearchFile').click(function(){
				$('#result').empty();
				$('#result').html("<div class='alert-primary alert'> Searching </div>");
				
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
			
			/// DELETE by submitting json file
			$('#btnDeleteFile').click(function(){
				$('#resultDelete').empty();
				$('#resultDelete').html("<div class='alert-primary alert'> Deleting </div>");
				
				handleDeleteFile();
			});
			
			/// ENCRYPT BLOB by submitting blob file		
			$('#btnProgressUploadBlob').click(function(){
				$('#resultUploadBlob').empty();
				$('#resultUploadBlob').html("<div class='alert-primary alert'> Progressive Encrypting </div>");
				if ($('#blobUpload').get(0).files.length === 0) {
					console.log("No files selected.");
				}
				else{
					var reader = new FileReader()
					reader.onload = handleBlobProgressUpload;
					var file = $('#blobUpload').get(0).files[0];
					var filename = file.name;
					var filetype = file.type;
					 $("#filename").val(filename);
					 $("#filetype").val(filetype);
					console.log("name:",filename,",type:",filetype);
					reader.readAsArrayBuffer(file);
				}
			});	
			
			$('#btnProgressDownloadBlob').click(function(){
				console.log("Progressive Downloading")
				fname = $("#filename1").val()
				keyId = $("#keyid6").val()
				handleProgressBlobDecrypt(fname,keyId);
			});	
			
			/// ENCRYPT BLOB with METADATA by submitting blob file and metadata file			
			$('#btnProgressUploadBlobSSE').click(function(){
				$('#uploadblobsse').empty();
				$('#uploadblobsse').html("<div class='alert-primary alert'> Uploading </div>");
				
				if ($('#blobSSEUpload').get(0).files.length == 0) {
					console.log("No files selected.");
				}
				else{
					var reader = new FileReader()
					var jsonObj = {"size":"unknown"}
					
					reader.onload = handleProgressBlobSSEUpload(jsonObj);
					var file = $('#blobSSEUpload').get(0).files[0];
					var filename = file.name;
					var filetype = file.type;
					 $("#filename").val(filename);
					 $("#filetype").val(filetype);
					console.log("name:",filename,",type:",filetype);
					reader.readAsArrayBuffer(file);
				}
			});
			
			$('#bntUploadSSEkeys').click(function(){
				var encK = $('#passphrase8').val();
				var verK = $('#passphrase8b').val();
				var token=$('#token8').val();
				
				if (encK=="" || verK=="" || token=="" ) {
					console.log("Please enter the keys and/or the token");
				}
				else{
					console.log("Uploading keys");
					var keyid=uploadSSEkeys(verK,encK,token);
					$("#keyid8").val(keyid);
					$("#uploadssekeys").val("submitted");
				}
			});
			$('#bntDownloadSSEkeys').click(function(){
				var keyid=$('#keyid9').val();
				var username=$('#username').val();
				var token=$('#token9').val();
				
				if (keyid=="" || token=="" || username=="") {
					console.log("Please enter the key id and/or token and/or username");
				}
				else{
					var ret=getSSEkeys(keyid,username,token);
					var keys=JSON.parse(ret);
					 $("#passphrase9").val(keys['encKey']);
					 $("#passphrase9b").val(keys['verKey']);
				}
			});
		});