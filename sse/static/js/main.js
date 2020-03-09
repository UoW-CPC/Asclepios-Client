/// APPLICATION CONFIGURATION
var appConfig={
	 'KeyG' : '123', //Key shared with TA
	 'key_encrypt': 'key encrypt',  //Key for encrypting/ decrypting json object
	 'used_fields' : 2, // number of active fields in json_form.html
	 'all_fields' : 24 // total number of fields in json_form.html
}
/// APPLICATION CONFIGURATION - End

/// HANDLERS
// Handle event of data upload data
function handleFileLoad(event){
	  var KeyG = appConfig.KeyG;
	  var Kenc = appConfig.key_encrypt; //Key for encrypting json object
      
	  var file_id = hash(Math.random().toString(36).substring(7)); // generate unique file_id. This should be changed in production
	  
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
}

// Handle search data event
function handleSearchFileLoad(event){
	var KeyG = appConfig.KeyG;	//shared key with TA
	var Kenc = appConfig.key_encrypt; //symmetric key which is used for decryption

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
			});//end btnSearch
			
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
		});