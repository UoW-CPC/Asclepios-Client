const [uploadData,search,updateData,deleteData,uploadKeyG] = require("../../sse/static/js/sse.js");

const input1 = { "firstname": "David" };
const file_id1 = "1";

const input2 = { "firstname": "David" , "lastname":"White"};//, "age":25};
const file_id2 = "2";

const file_id3 = "3";

const nfound1 = 1; // after inserting input1
const nfound2 = 2;  // after inserting input2
const nfound3 = 0; // after deleting 2 files

const KeyG="abc";
const Kenc = "abc";

const criteria1 = { "keyword": "firstname|David" };
const criteria2 = { "keyword": "firstname|Peter" };
const criteria3 = { "keyword": "lastname|Yellow" };

const update1 = {"firstname":["Mary","Peter"]};
const update2 = {"firstname":["David","Peter"]};
const update3 = {"firstname":["David","Peter"],"lastname":["Black","Yellow"]};
const update4 = {"firstname":["David","Peter"],"lastname":["White","Yellow"]};

describe("upload shared key to TA",() => {
	test("upload shared key to TA should return true", () => {
		var result = uploadKeyG(KeyG);
		expect(result).toEqual(true);
	});
});

describe("upload and search", () => {
	test("search for non-existed data should return not found", () => {
		var result = search(criteria1,KeyG,Kenc);
		expect(result["count"]).toEqual(0);	
	});
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
		uploadData(input1,file_id1,KeyG,Kenc,callback);    
	});
	test("search for uploaded data should return found results", ()  => {
		var result = search(criteria1,KeyG,Kenc);
		expect(result["count"]).toBeGreaterThan(0);
	}); 	
	test("2nd search for uploaded data should return found results", () => {
		var result = search(criteria1,KeyG,Kenc);
		expect(result["count"]).toEqual(nfound1);
	});
  
	test("it should not upload json object with existed file id (uRl)", () => {;
		expect(uploadData(input1,file_id1,KeyG,Kenc)).toEqual(false);
	});

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
		uploadData(input2,file_id2,KeyG,Kenc,callback);    
	});	
	test("search for uploaded data should return at least 2 found results", ()  => {
		var result = search(criteria1,KeyG,Kenc);
		expect(result["count"]).toEqual(nfound2);
	});

});

describe("update and search", () => {
	test("update one non-existed value should return false", () => {
		var result = updateData(update1,file_id1,KeyG,Kenc);
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
		updateData(update2,file_id1,KeyG,Kenc,callback);
	});
	test("search updated value should return 1 found result", () => {
		var result = search(criteria2,KeyG,Kenc);
		expect(result["count"]).toEqual(nfound1);
	});
	test("search previous value should return 1 found result", () => {
		var result = search(criteria1,KeyG,Kenc);
		expect(result["count"]).toEqual(nfound1);
	});
	test("update a pair of values, one among which does not exist, should return false", ()  => {
		var result = updateData(update3,file_id2,KeyG,Kenc);
		expect(result).toEqual(false);
	});
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
		updateData(update4,file_id2,KeyG,Kenc,callback);
	});
	test("search updated value should return 2 found result", () => {
		var result = search(criteria2,KeyG,Kenc);
		expect(result["count"]).toEqual(nfound2);
	});
	test("search updated new value should return 1 found result", () => {
		var result = search(criteria3,KeyG,Kenc);
		expect(result["count"]).toEqual(nfound1);
	});
	test("search previous value should return not found", () => {
		var result = search(criteria1,KeyG,Kenc);
		expect(result["count"]).toEqual(0);
	});
});

describe("delete and search", () => {
	test("delete one non-existed file_id should return false", () => {
		var result = deleteData(file_id3,KeyG,Kenc);
		expect(result).toEqual(false);
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
		deleteData(file_id1,KeyG,Kenc,callback);
	});
	test("search value should return 1 found result", () => {
		var result = search(criteria2,KeyG,Kenc);
		expect(result["count"]).toEqual(nfound1);
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
		deleteData(file_id2,KeyG,Kenc,callback);
	});
	test("search value should return 0 found result", () => {
		var result = search(criteria1,KeyG,Kenc);
		expect(result["count"]).toEqual(nfound3);
	});
});

