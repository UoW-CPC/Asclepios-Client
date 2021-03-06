const [uploadData,search,updateData,deleteData,uploadKeyG,computeKey] = require("../../sse/static/js/sse.js");

//jest.setTimeout(5000);

const keyid1 = "1"
const keyid2 = "2"
	
const input1 = { "firstname": "David" };
const file_id1 = "1";

const input2 = { "firstname": "David" , "lastname":"White"};//, "age":25};
const file_id2 = "2";

const file_id3 = "3";

const input4 = {"name":"John","age":28,"gender":"male","job":"doctor"};
const file_id4 = "4";
const input5 = {"name":"Jenny","age":26,"gender":"female","job":"doctor"};
const file_id5 = "5";
const input6 = {"name":"Steve","age":30,"gender":"male","job":"nurse"};
const file_id6 = "6";
const input7 = {"name":"Sophie","age":30,"gender":"female","job":"nurse"};
const file_id7 = "7";
const input8 = {"name":"Stuart","age":30,"gender":"male","job":"scientist"};
const file_id8 = "8";

const nfound1 = 1; // after inserting input1
const nfound2 = 2;  // after inserting input2
const nfound3 = 0; // after deleting 2 files

// test encryption/decryption with password
const iskey = false
const KeyG1="123"; //password
const Kenc1 = "abc"; // password
const KeyG2="456"; //password
const Kenc2 = "def";//password

const key_KeyG1="fb77d1464189bb07f7f1d6d524b9eaaf"; // Key (hex string) which is generated from the password in KeyG1
const key_Kenc1 = "ed0f78e4cfd589337faf5b6d5e07637081426bcf32b5a2fab9a4b7517147bf2c"; // Key (hex string) which is generated from the password in Kenc1

const key_KeyG2="9751c56747f3867e76d39968d3de9e31"; // Key (hex string) which is generated from the password in KeyG2
const key_Kenc2 = "d89f8ad6988ba7aba42ddbdf2453f2241d3edafc96757f750911df1c8e986179"; // Key (hex string) which is generated from the password in Kenc2


const criteria1 = { "keyword": "firstname|David" };
const criteria2 = { "keyword": "firstname|Peter" };
const criteria3 = { "keyword": "lastname|Yellow" };

const criteria4 = { "keyword": ["gender|male","job|doctor","job|nurse"],
		"condition" : "(1*2) + (1*3)"}; // male doctor or male nurse: found 2
const nfound4 = 2;
const criteria5 = { "keyword": ["job|doctor","job|scientist"],
		"condition": "1+2"}; //doctor or scientist
const nfound5 = 3;
const criteria6 = { "keyword": ["gender|male","age|30"],
		"condition": "1*2"}; // male, age 30
const nfound6 = 2;
const criteria7 = { "keyword": ["gender|female","job|doctor","job|nurse"],
		"condition": "2 + 1*3"}; // doctor, or female nurse
const nfound7 = 3;
const criteria8 = { "keyword": ["job|doctor","age|26","age|28"],
		"condition": "1*(2+3)"}; // doctor at age 26 or 28
const nfound8 = 2;
const criteria9 = { "keyword": ["job|scientist","gender|female"],
		"condition": "1*2"}; // female scientist
const nfound9 = 0;

const criteria10 = { "keyword" : "name|Stuart" } // single criterion
const nfound10 = 1;

const criteria11 = { "keyword" : ["name|Stuart"] } // single criterion
const nfound11 = 1;

const update1 = {"firstname":["Mary","Peter"]};
const update2 = {"firstname":["David","Peter"]};
const update3 = {"firstname":["David","Peter"],"lastname":["Black","Yellow"]};
const update4 = {"firstname":["David","Peter"],"lastname":["White","Yellow"]};

const isfe = false;
const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJSYmxwdXNjRmZmNXVQWmlMcnlEMTgyVjVMR29ZVXcxczhoMEtMcEhDTndNIn0.eyJleHAiOjE2MTczNTYxNDQsImlhdCI6MTYxNzM1MjU0NCwianRpIjoiMzYxMTdmZmEtN2I0MS00YTU5LTliOWEtNTQyMjE2YTJmZTZjIiwiaXNzIjoiaHR0cDovLzUxLjE0MC40MS4xNDo4MTgxL2F1dGgvcmVhbG1zL3NuZXQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiM2YwYjM5Y2ItMGExYi00NDI4LWIzNmYtYjhjMDk4MTI2ZGJkIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiY2FsbHMtZ2F0ZXdheSIsInNlc3Npb25fc3RhdGUiOiI4ZjRiYTdiNC05ODE1LTQ4YTMtODllZS1iNWZkMzhiNTI3MTMiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly81MS4xNDUuMTAuMzUiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwibWVtYmVyIiwiYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsIm1lZGljYWwtcm9sZXMiOiJ4eHgsYW1idWxhbmNlLWNyZXciLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImFtYnVsYW5jZS1jcmV3LWlkIjoiYW1idWxhbmNlLWNyZXctaWQtMTIzNCIsIkRPQiI6IjE5ODAtMDQtMDUiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ1c2VyMSJ9.QfuRB2OniNtIq1RUsDYoz-IELs5-8I9q8EmeZsu9o-qP1WhNMrRD8XslUSZieRz-C2skOVzpgfMVQnrQmHo9-Zv2wTO4UWnuGq252CWMNQEI3bgDX6i5iFRed3C43VJwp144XbXdzmvawv4xKJB_pZfwcJDffynQmNoTIx7PuPugmMno8y1_oFtJMZblf44x3tTn0pYn3vqfS8Ph8gYvgxHqZ7EcITY8GFsxoRjcf6TyDNxuIQXCS4KrFbz3szfOijnxv-TCL6K1IJR5Ch02mgppqy3gS799eYb3r3GiMMOJEfi8hIUQUlHzXKyY5bdaM7VVoNPOspoSAuzqkoi1_Q"
	
	
/*const fpath_docx = "data/file.docx"
const fname_docx = "file.docx"
const ftype_docx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	
const fpath_txt="data/file.txt"
const fname_txt = "file.txt";
const ftype_txt = "text/plain";

const fpath_edf="data/file.edf"
const fname_edf = "file.edf";
const ftype_edf = "";

const fpath_pdf="data/file.pdf"
const fname_pdf = "file.pdf";
const ftype_pdf = "application/pdf";

const fpath_pptx="data/file.pptx"
const fname_pptx = "file.pptx";
const ftype_pptx = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
	
const fpath_png="data/file.png"
const fname_png = "file.png";
const ftype_png = "image/png";

const fpath_jpg="data/file.jpg"
const fname_jpg = "file.jpg";
const ftype_jpg = "image/jpg";

const fpath_mov="data/file.MOV"
const fname_mov = "file.MOV";
const ftype_mov = "video/quicktime";

const fpath_xlsx="data/file.xlsx"
const fname_xlsx = "file.xlsx";
const ftype_xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
	
const fpath_cdm="data/file.dcm"
const fname_cdm = "file.dcm";
const ftype_cdm = "application/dicom";*/
	
window.URL.createObjectURL = function() {};
window.URL.revokeObjectURL = function() {};

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
	
const file_id = "data0"
const upload_file = "../data/data0.json"
const search_file = "../data/search0.json"	
const search_file1 = "../data/search1.json"
const update_file = "../data/data0_update.json"
	
const input_json = require(upload_file)
const search_json = require(search_file)
const search_json1 = require(search_file1)
const update_json = require(update_file)


describe("upload shared key to TA",() => {
	//input is a password. The key will be generated from the password.
	test("upload shared key to TA should return true", () => {
		var key = computeKey(KeyG1,true);
		var result = uploadKeyG(key,keyid1,token);
		expect(result).toEqual(true);
	});
	// input is a key
	test("upload shared key to TA should return true", () => {
		var result = uploadKeyG(key_KeyG2,keyid2,token);
		expect(result).toEqual(true);
	});
});


describe("upload and search", () => {
	test("search for non-existed data should return not found", () => {
		var result = search(criteria1,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(0);	
	});
	// upload data with password
	test("it should upload json object successfully", done => {
		function callback(data) {
			try {
				expect(data).toBe(true);
				done();
			} catch (error) {
				console.log("errors")
				done(error);
			}
		};
		uploadData(input1,file_id1,KeyG1,Kenc1,keyid1,iskey,token,callback);
	});
	
	// search data with password
	test("2nd search for uploaded data should return found results", () => {
		var result = search(criteria1,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound1);
	});
  
	// search data with key
	test("2nd search for uploaded data should return found results", () => {
		var result = search(criteria1,key_KeyG1,key_Kenc1,keyid1,true,isfe,token);
		expect(result["count"]).toEqual(nfound1);
	});
	
	test("it should not upload json object with existed file id (uRl) with the same keyid, but should with different keyid", () => {;
		expect(uploadData(input1,file_id1,KeyG1,Kenc1,keyid1,iskey,token)).toEqual(false);
		expect(uploadData(input1,file_id1,KeyG2,Kenc2,keyid2,iskey,token)).toEqual(true);
	});

	// upload data with key
	test("it should upload json object with more than 1 field successfully", done => {
		function callback(data) {
			try {
				expect(data).toBe(true);
				done();
			} catch (error) {
				console.log("errors")
				done(error);
			}
		};
		uploadData(input2,file_id2,key_KeyG1,key_Kenc1,keyid1,true,token,callback);    
	});	
	test("search for uploaded data with keyid1 should return at least 2 found results, and with keyid2 should return 1 result", ()  => {
		var result = search(criteria1,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound2);
		var result = search(criteria1,KeyG2,Kenc2,keyid2,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound1);
	});

});


describe("update and search", () => {
	test("update one non-existed value should return false", () => {
		var result = updateData(update1,file_id1,KeyG1,Kenc1,keyid1,iskey,token);
		expect(result).toEqual(false);
	});
	test("update one existed value should return true", done => {
		function callback(data) {
			try {
				expect(data).toBe(true);
				done();
			} catch (error) {
				console.log("errors")
				done(error);
			}
		};
		updateData(update2,file_id1,KeyG1,Kenc1,keyid1,iskey,token,callback);
	});
	test("search updated value should return 1 found result", () => {
		var result = search(criteria2,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound1);
	});
	
	test("search previous value should return 1 found result", () => {
		var result = search(criteria1,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound1);
	});
	test("update a pair of values, one among which does not exist, should return false", ()  => {
		var result = updateData(update3,file_id2,KeyG1,Kenc1,keyid1,iskey,token);
		expect(result).toEqual(false);
	});
	
	// update data with key
	test("update a pair of existed values should return true", done => {
		function callback(data) {
			try {
				expect(data).toBe(true);
				done();
			} catch (error) {
				console.log("errors")
				done(error);
			}
		};
		updateData(update4,file_id2,key_KeyG1,key_Kenc1,keyid1,true,token,callback);
	});
	test("search updated value should return 2 found result", () => {
		var result = search(criteria2,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound2);
	});
	test("search updated new value should return 1 found result", () => {
		var result = search(criteria3,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound1);
	});
	test("search previous value should return not found", () => {
		var result = search(criteria1,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(0);
	});
});

describe("delete and search", () => {
	test("delete one non-existed file_id should return false", () => {
		var result = deleteData(file_id3,KeyG1,Kenc1,keyid1,iskey,token);
		expect(result).toEqual(false);
	});
	
	// delete data with password
	test("delete one existed value should return true", done => {
		function callback(data) {
			try {
				expect(data).toBe(true);
				done();
			} catch (error) {
				console.log("errors")
				done(error);
			}
		};
		deleteData(file_id1,KeyG1,Kenc1,keyid1,iskey,token,callback);
	});
	test("search value should return 1 found result", () => {
		var result = search(criteria2,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound1);
	});
	
	//delete data with key
	test("delete one existed value should return true", done => {
		function callback(data) {
			try {
				expect(data).toBe(true);
				done();
			} catch (error) {
				console.log("errors")
				done(error);
			}
		};
		deleteData(file_id2,key_KeyG1,key_Kenc1,keyid1,true,token,callback);
	});
	test("search value should return 0 found result", () => {
		var result = search(criteria1,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound3);
	});
	test("search value with keyid2 should still return 1 found result", () => {
		var result = search(criteria1,KeyG2,Kenc2,keyid2,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound1);
	});
});

describe("upload and search with complex query", () => {
	// upload data with password
	test("it should upload json objects successfully", done => {
		function callback(data) {
			try {
				expect(data).toBe(true);
				done();
			} catch (error) {
				console.log("errors")
				done(error);
			}
		};
		
		uploadData(input4,file_id4,KeyG1,Kenc1,keyid1,iskey,token,callback);
		uploadData(input5,file_id5,KeyG1,Kenc1,keyid1,iskey,token,callback);
		uploadData(input6,file_id6,KeyG1,Kenc1,keyid1,iskey,token,callback);
		uploadData(input7,file_id7,KeyG1,Kenc1,keyid1,iskey,token,callback);
		uploadData(input8,file_id8,KeyG1,Kenc1,keyid1,iskey,token,callback);
		
		var result = search(criteria5,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		console.log("found results:",result);
		expect(result["count"]).toEqual(nfound5);
		
		var result = search(criteria5,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound5);
		
		var result = search(criteria5,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound5);
		
		var result = search(criteria5,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound5);
	});
	// search data with password
	test("complex search with OR for uploaded data should return found results", () => {
		var result = search(criteria5,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound5);
	});
	
	test("complex search with AND for uploaded data should return found results", () => {
		var result = search(criteria6,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound6);
		
		result = search(criteria9,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound9);
	});
	
	test("complex search with OR and AND for uploaded data should return found results (only return file ids and keyid)", () => {
		var result = search(criteria4,KeyG1,Kenc1,keyid1,iskey,true,token);
		expect(result["count"]).toEqual(nfound4);
		
		result = search(criteria7,KeyG1,Kenc1,keyid1,iskey,true,token);
		expect(result["count"]).toEqual(nfound7);
		
		result = search(criteria8,KeyG1,Kenc1,keyid1,iskey,true,token);
		expect(result["count"]).toEqual(nfound8);
	});
	
	test("search by single keyword should return found results", () => {
		var result = search(criteria10,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound10);
		
		result = search(criteria11,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(nfound11);
	});
});

/*
describe("test large file",() => {
	test("it should upload large json object successfully", done => {
		function callback(data) {
			try {
				expect(data).toBe(true);
				done();
			} catch (error) {
				console.log("errors")
				done(error);
			}
		};

		uploadData(input_json,file_id,KeyG1,Kenc1,keyid1,iskey,token,callback);
		    
	});
	
	test("search for uploaded data should return found results", () => {
		var result = search(search_json,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(1);
	});
	test("update existed values should return true", done => {
		function callback(data) {
			try {
				expect(data).toBe(true);
				done();
			} catch (error) {
				console.log("errors")
				done(error);
			}
		};
		updateData(update_json,file_id,KeyG1,Kenc1,keyid1,iskey,token,callback);
	});
	test("search new value should return 1 found result", () => {
		var result = search(search_json1,KeyG1,Kenc1,keyid1,iskey,isfe,token);
		expect(result["count"]).toEqual(1);
	});
	test("delete one existed value should return true", done => {
		function callback(data) {
			try {
				expect(data).toBe(true);
				done();
			} catch (error) {
				console.log("errors")
				done(error);
			}
		};
		deleteData(file_id,KeyG1,Kenc1,keyid1,iskey,token,callback);
	});

});
*/

//describe("upload blob", () => {
//	test("upload large file returns true", async () => {
//		function callback(data) {
//			try {
//				expect(data).toBe(true);
//				done();
//			} catch (error) {
//				console.log("errors");
//				done(error);
//			}
//		};
//		
//		var fs = require('fs');
//		 
//		var contents = fs.readFileSync(fpath_txt);
//		console.log("contents:",contents);	
//	    var blobData = new Blob([contents], {type: ftype_txt});	        
//	    await encryptProgressUploadBlob(blobData,fname_txt,Kenc1,callback);
//	});
	
//	test("upload txt file returns true", async () => {
//		function callback(data) {
//			try {
//				expect(data).toBe(true);
//				//done();
//			} catch (error) {
//				console.log("errors");
//				done(error);
//			}
//		};
//		
//		var fs = require('fs');
//		 
//		var contents = fs.readFileSync(fpath_txt, 'utf8');
//		console.log("contents:",contents);	
//	    var blobData = new Blob([contents], {type: ftype_txt});	        
//	    await encryptUploadBlob(blobData,fname_txt,Kenc,callback);
//	});
//	test("upload docx file returns true", async () => {
//		function callback(data) {
//			try {
//				expect(data).toBe(true);
//				//done();
//			} catch (error) {
//				console.log("errors");
//				done(error);
//			}
//		};
//		
//		var fs = require('fs');
//		 
//		var contents = fs.readFileSync(fpath_docx, 'utf8');
//		console.log("contents:",contents);	
//	    var blobData = new Blob([contents], {type: ftype_docx});	        
//	    await encryptUploadBlob(blobData,fname_docx,Kenc,callback);
//	});
//	test("upload pdf file returns true", async () => {
//		function callback(data) {
//			try {
//				expect(data).toBe(true);
//				//done();
//			} catch (error) {
//				console.log("errors");
//				done(error);
//			}
//		};
//		
//		var fs = require('fs');
//		 
//		var contents = fs.readFileSync(fpath_pdf, 'utf8');
//		console.log("contents:",contents);	
//	    var blobData = new Blob([contents], {type: ftype_pdf});	        
//	    await encryptUploadBlob(blobData,fname_pdf,Kenc,callback);
//	});
//	test("upload png file returns true", async () => {
//		function callback(data) {
//			try {
//				expect(data).toBe(true);
//				//done();
//			} catch (error) {
//				console.log("errors");
//				done(error);
//			}
//		};
//		
//		var fs = require('fs');
//		 
//		var contents = fs.readFileSync(fpath_png, 'utf8');
//		console.log("contents:",contents);	
//	    var blobData = new Blob([contents], {type: ftype_png});	        
//	    await encryptUploadBlob(blobData,fname_png,Kenc,callback);
//	});
//	test("upload jpg file returns true", async () => {
//		function callback(data) {
//			try {
//				expect(data).toBe(true);
//				//done();
//			} catch (error) {
//				console.log("errors");
//				done(error);
//			}
//		};
//		
//		var fs = require('fs');
//		 
//		var contents = fs.readFileSync(fpath_jpg, 'utf8');
//		console.log("contents:",contents);	
//	    var blobData = new Blob([contents], {type: ftype_jpg});	        
//	    await encryptUploadBlob(blobData,fname_jpg,Kenc,callback);
//	});
//	test("upload pptx file returns true", async () => {
//		function callback(data) {
//			try {
//				expect(data).toBe(true);
//				//done();
//			} catch (error) {
//				console.log("errors");
//				done(error);
//			}
//		};
//		
//		var fs = require('fs');
//		 
//		var contents = fs.readFileSync(fpath_pptx, 'utf8');
//		console.log("contents:",contents);	
//	    var blobData = new Blob([contents], {type: ftype_pptx});	        
//	    await encryptUploadBlob(blobData,fname_pptx,Kenc,callback);
//	});
//	test("upload xlsx file returns true", async () => {
//		function callback(data) {
//			try {
//				expect(data).toBe(true);
//				//done();
//			} catch (error) {
//				console.log("errors");
//				done(error);
//			}
//		};
//		
//		var fs = require('fs');
//		 
//		var contents = fs.readFileSync(fpath_xlsx, 'utf8');
//		console.log("contents:",contents);	
//	    var blobData = new Blob([contents], {type: ftype_xlsx});	        
//	    await encryptUploadBlob(blobData,fname_xlsx,Kenc,callback);
//	});
//	test("upload cdm file returns true", async () => {
//		function callback(data) {
//			try {
//				expect(data).toBe(true);
//				//done();
//			} catch (error) {
//				console.log("errors");
//				done(error);
//			}
//		};
//		
//		var fs = require('fs');
//		 
//		var contents = fs.readFileSync(fpath_cdm, 'utf8');
//		console.log("contents:",contents);	
//	    var blobData = new Blob([contents], {type: ftype_cdm});	        
//	    await encryptUploadBlob(blobData,fname_cdm,Kenc,callback);
//	});
	
//	test("upload mov file returns true", async () => {
//		function callback(data) {
//			try {
//				expect(data).toBe(true);
//				//done();
//			} catch (error) {
//				console.log("errors");
//				done(error);
//			}
//		};
//		
//		var fs = require('fs');
//		 
//		var contents = fs.readFileSync(fpath_mov, 'utf8');
//		console.log("contents:",contents);	
//	    var blobData = new Blob([contents], {type: ftype_mov});	        
//	    await encryptUploadBlob(blobData,fname_mov,Kenc,callback);
//	});
//	test("download txt file returns true", async () => {
//		function callback(data) {
//			try {
//				expect(data).toBe(true);
//			} catch (error) {
//				console.log("errors")
//				done(error);
//			}
//		};
//		
////		function saveBlob(blob, fileName) {
////			console.log("save file")
////			console.log(blob)
////			 var a = document.createElement("a");
////			 document.body.appendChild(a);
////			 a.style = "display: none";
////			 var url = window.URL.createObjectURL(blob);
////			 a.href = url;
////			 a.download = fileName;
////			 a.click();
////			 console.log("click")
////			 window.URL.revokeObjectURL(url);
////		};
//	
////		var promise = downloadDecryptBlob(fname_txt,Kenc,callback);
////		promise.then(function(data) {
////			//saveBlob(data,fname_txt)
////			console.log(data)
////		});
////		return promise;
//		await downloadDecryptBlob(fname_txt,Kenc,callback);
//	});
////		return Promise.resolve(downloadDecryptBlob(fname_txt,Kenc,callback))
////			    .then(() => {})
////			    .then(() => {});
//});
	
//	test("upload docx file returns true", async () => {
//		function callback(data) {
//			try {
//				expect(data).toBe(true);
//				//done();
//			} catch (error) {
//				console.log("errors");
//				done(error);
//			}
//		};
//		
//		var fs = require('fs');
//		 
//		var contents = fs.readFileSync(fpath_docx, 'binary').toString('utf8');;
//		console.log("contents:",contents);	
//	    var blobData = new Blob([contents], {type: ftype_docx});	        
//	    await encryptUploadBlob(blobData,fname_docx,Kenc,callback);
//	});
//	test("download pdf file returns true", done => {
//		function callback(data) {
//			try {
//				expect(data).toBe(true);
//				done();
//			} catch (error) {
//				console.log("errors")
//				done(error);
//			}
//		};
//		deleteData(file_id1,KeyG,Kenc,callback);
//	});
//	test("upload docx file returns true", () => {
//		var result = search(criteria2,KeyG,Kenc);
//		expect(result["count"]).toEqual(nfound1);
//	});
//	test("download docx file returns true", done => {
//		function callback(data) {
//			try {
//				expect(data).toBe(true);
//				done();
//			} catch (error) {
//				console.log("errors")
//				done(error);
//			}
//		};
//		deleteData(file_id2,KeyG,Kenc,callback);
//	});
//	test("upload xlsx file returns true", () => {
//		var result = search(criteria1,KeyG,Kenc);
//		expect(result["count"]).toEqual(nfound3);
//	});
//	test("download xlsx file returns true", () => {
//		var result = search(criteria1,KeyG,Kenc);
//		expect(result["count"]).toEqual(nfound3);
//	});
//	test("upload png file returns true", () => {
//		var result = search(criteria1,KeyG,Kenc);
//		expect(result["count"]).toEqual(nfound3);
//	});
//	test("download png file returns true", () => {
//		var result = search(criteria1,KeyG,Kenc);
//		expect(result["count"]).toEqual(nfound3);
//	});
//	test("upload jpg file returns true", () => {
//		var result = search(criteria1,KeyG,Kenc);
//		expect(result["count"]).toEqual(nfound3);
//	});
//	test("download jpg file returns true", () => {
//		var result = search(criteria1,KeyG,Kenc);
//		expect(result["count"]).toEqual(nfound3);
//	});
//	test("upload avi file returns true", () => {
//		var result = search(criteria1,KeyG,Kenc);
//		expect(result["count"]).toEqual(nfound3);
//	});
//	test("download avi file returns true", () => {
//		var result = search(criteria1,KeyG,Kenc);
//		expect(result["count"]).toEqual(nfound3);
//	});

//});


