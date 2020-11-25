var feConfig = {
  url_ta: "fe_ta_url", //This will be replaced with correct value at runtime at the web server
  url_ev: "fe_ev_url", //This will be replaced with correct value at runtime at the web server
};
const globalFileIDs = [];

let currentDATA = {};
const text_truncate = (str, length, ending) => {
  if (length == null) {
    length = 100;
  }
  if (ending == null) {
    ending = "...";
  }
  if (str.length > length) {
    return str.substring(0, length - ending.length) + ending;
  } else {
    return str;
  }
};

const resetNotify = () => {
  document.getElementById("notify-fe").innerHTML = "";
};
const notify = (text) => {
  try {
    document.getElementById("notify-fe").innerHTML = `${
      document.getElementById("notify-fe").innerHTML
    }<div class='alert-primary alert'>${text_truncate(text, 192)}</div>`;
  } catch (error) {
    console.log(text);
  }
};

const notifyAnalyst = (text) => {
  try {
    document.getElementById(
      "notify-analyst"
    ).innerHTML = `<div class='alert-primary alert'>${text_truncate(
      text,
      32
    )}</div>`;
  } catch (error) {
    console.log(text);
  }
};

const checkBoxFieldList = [];
const resetCheckBox = () => {
  const checkBoxEl = document.getElementById("fe-checkbox");
  checkBoxEl.innerHTML = "";
  checkBoxFieldList.splice(0, checkBoxFieldList.length);
  document.getElementById("fe-fields").setAttribute("style", "display: none;");
  document
    .getElementById("fe-fields-not-supported")
    .setAttribute("style", "display: true;");
};

const addCheckBox = (field) => {
  const checkBoxEl = document.getElementById("fe-checkbox");
  if (!checkBoxFieldList) {
    checkBoxEl.innerHTML = "";
  }
  if (checkBoxFieldList.includes(field)) {
    return;
  }
  checkBoxEl.innerHTML += checkBoxItemTemplate(field);
  document.getElementById("fe-fields").setAttribute("style", "display: true;");
  document
    .getElementById("fe-fields-not-supported")
    .setAttribute("style", "display: none;");
  checkBoxFieldList.push(field);
};

const getFeFieldChooses = () => {
  const checkedField = new Array();
  for (const field of checkBoxFieldList) {
    const fieldId = `fe-${field}`;
    if (!!document.getElementById(fieldId).checked) checkedField.push(field);
  }
  return checkedField;
};

const encryptDataAndSendFE = (dataWithIDs) => {
  fetch(`http://${feConfig.url_ta}/get-keys`, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "no-cors",
    },
    body: JSON.stringify(Object.keys(dataWithIDs)),
  })
    .then(async function (response) {
      try {
        const results = (await response.json()).results;
        console.log(results.fileIDsExists);
        console.log(results.feKeys);
        if (!!results.fileIDsExists && results.fileIDsExists.length > 0) {
          notify(`FE fileIDs exists:${JSON.stringify(results.fileIDsExists)}`);
        }
        if (!Object.entries(results.feKeys).length) {
          if (!!e) {
            e.preventDefault();
          }
          return;
        }
        const feKeys = results.feKeys;
        const encryptedData = {};
        for (const id in feKeys) {
          try {
            if (feKeys.hasOwnProperty(id)) {
              console.log(id + " -> " + feKeys[id]);
              encryptedData[id] = dataWithIDs[id] + feKeys[id];
              console.log(`encryptedData[${id}]=${encryptedData[id]}`);
            }
          } catch (e) {
            console.log(e);
          }
        }

        if (!!encryptedData) {
          fetch(`http://${feConfig.url_ev}/ciphertexts`, {
            method: "post",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(encryptedData),
          })
            .then(async function (response) {
              console.log(response);
              notify(`FE Ciphertexts:${JSON.stringify(encryptedData)}`);
            })
            .catch(function (error) {
              console.error(error);
            });
        }
        console.log(dataWithIDs);
      } catch (e) {
        console.log(e);
      }
    })
    .catch(function (error) {
      console.error(error);
    });
  // });
};

let feKeysBodyRequest = Array();
let dataWithIDs = {};
const checkBoxItemTemplate = (
  field
) => `<input type="checkbox" id="fe-${field}" name="${field}">
<label for="fe-${field}" id="fe-label-${field}">${field}</label>`;

const buildCheckBoxesFromInputFile = (jsonString) => {
  resetCheckBox();
  try {
    /*
                  [
                      {
                          "age": 30,
                          "heigth": 160,
                          "fileID": 111
                      },
      
                      {
                          "age": 20,
                          "heigth": 165,
                          "fileID": 112
                      }
                  ]
                  */

    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) {
      loopThroughKeys(data);
      return;
    }
    for (const entry of data) {
      loopThroughKeys(entry);
    }
  } catch (e) {
    notify("Invalid json file");
    console.log("Invalid data" + e);
  }
};
const parseInput = (jsonString, checkedField) => {
  try {
    /*
                  [
                      {
                          "age": 30,
                          "heigth": 160,
                          "fileID": 111
                      },
      
                      {
                          "age": 20,
                          "heigth": 165,
                          "fileID": 112
                      }
                  ]
                  */

    let data = JSON.parse(jsonString);
    console.log(data);
    // const ourForm = document.getElementById("fe-fields").parentElement;
    // const globalFileIDs = ourForm.querySelector("#fileid1").value.split(",");

    feKeysBodyRequest = Array();
    dataWithIDs = {};
    if (!Array.isArray(data)) {
      data = [data];
    }
    const tmpGlobalFileIDs = globalFileIDs;
    for (const entry of data) {
      console.log(entry);
      const currentFeKeyRowRequestBody = {};
      currentFeKeyRowRequestBody["fields"] = new Array();
      // dataWithIDs[json["fileID"]] = {};
      let fileID = tmpGlobalFileIDs.shift();
      feKeysBodyRequest;
      currentFeKeyRowRequestBody["fileID"] = fileID;
      for (const id in entry) {
        if (id.toLowerCase() === "fileid") continue;
        if (!checkedField.includes(id)) continue;
        currentFeKeyRowRequestBody["fields"].push(id);
        dataWithIDs[`${fileID}@${id}`] = entry[id];

        // dataWithIDs[json["fileID"]][id] = json[id];
      }
      if (
        !!currentFeKeyRowRequestBody["fields"] &&
        !!currentFeKeyRowRequestBody["fields"].length
      ) {
        feKeysBodyRequest.push(currentFeKeyRowRequestBody);
      }
    }
  } catch (e) {
    console.log("Invalid data" + e);
  }
};

const computeFE = (fileIDs, field, operator) => {
  // Checks if fields are filled-in or not, returns response "<p>Please enter your details.</p>" if not.
  if (!fileIDs || fileIDs.length === 0 || field == "" || operator == "") {
    // notifyAnalyst("Please enter your details.");

    notifyAnalyst(`${operator}=0`);
    return 0;
  }

  const computeBodyRequest = {
    fileIDs: fileIDs,
    field,
    function: operator,
  };
  fetch(`http://${feConfig.url_ta}/compute`, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(computeBodyRequest),
  })
    .then(async function (response) {
      console.log(response);
      if (response.status >= 200 && response.status < 300) {
        try {
          const token = (await response.json()).token;
          console.log(token);
          fetch(`http://${feConfig.url_ev}/get-result`, {
            method: "post",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          })
            .then(async function (response) {
              try {
                const results = (await response.json()).results;
                console.log(results);

                notifyAnalyst(`${operator}=${results}`);
                return results;
              } catch (e) {
                console.log(e);
              }
            })
            .catch(function (error) {
              console.error(error);
            });
        } catch (e) {
          console.log(e);
        }
      } else {
        try {
          notifyAnalyst((await response.json()).message);
        } catch (error) {
          notifyAnalyst("Something went wrong!!!");
        }
      }
    })
    .catch(function (error) {
      console.error(error);
    });
};

function handleFeSearchFileLoad(event) {
  //var KeyG = appConfig.KeyG;	//shared key with TA
  //var Kenc = appConfig.key_encrypt; //symmetric key which is used for decryption
  var Kenc = $("#fe-passphrase").val();
  var KeyG = Kenc;

  var jsonObj = JSON.parse(event.target.result);

  var st_date = new Date();
  var st_time = st_date.getTime();

  retriveFileIDsEnabled = true;
  var results = search(jsonObj, KeyG, Kenc);

  if (results == null) {
    message = "Invalid input file";
  } else message = results["count"];

  var end_date = new Date();
  var end_time = end_date.getTime();
  var diff = end_time - st_time;

  console.log("Found results:", results);

  const field = encodeURIComponent(
    document.getElementById("fe-analyst-field").value
  );
  const operator = encodeURIComponent(
    document.getElementById("fe-analyst-function").value
  );
  const fileIDs = feFileIDs();
  if (!fileIDs || fileIDs.length === 0 || field == "" || operator == "") {
    notifyAnalyst("Please enter your details.");
  } else {
    computeFE(fileIDs, field, operator);
  }
  retriveFileIDsEnabled = false;
}

const fePostComputeData = (formsubmission) => {
  if (
    document.getElementById("fe-menu2").getAttribute("class").includes("active")
  ) {
    const feFileElement = document.getElementById("fe-search-file");
    if (feFileElement.files.length === 0) {
      console.log("No files selected.");
    } else {
      var reader = new FileReader();
      reader.onload = handleFeSearchFileLoad;
      reader.readAsText(feFileElement.files[0]);
    }
  } else {
    const fileIDs = document.getElementById("fe-analyst-fileIDs").value;

    const field = encodeURIComponent(
      document.getElementById("fe-analyst-field").value
    );
    const operator = encodeURIComponent(
      document.getElementById("fe-analyst-function").value
    );
    computeFE(fileIDs.replace(" ", "").split(","), field, operator);
  }

  // formsubmission.preventDefault();
};

(function () {
  // your page initialization code here
  // the DOM will be available here
  document.getElementById("jsonFile").addEventListener("change", function () {
    resetNotify();
    var fr = new FileReader();
    fr.onload = function () {
      buildCheckBoxesFromInputFile(fr.result);
      currentDATA = fr.result;
    };
    fr.readAsText(this.files[0]);
  });

  // document
  //   .getElementById("btnSubmitFile")
  //   .addEventListener("click", function (e) {
  //     submitFEData(e);
  //   });

  document
    .getElementById("fe-analyst-compute")
    .addEventListener("click", fePostComputeData);
})();

const submitFEData = (e) => {
  resetNotify();
  console.log(currentDATA);
  parseInput(currentDATA, getFeFieldChooses());
  console.log(feKeysBodyRequest);
  console.log(dataWithIDs);
  encryptDataAndSendFE(dataWithIDs);
};

const loopThroughKeys = (entry) => {
  console.log(entry);
  for (const id in entry) {
    if (id.toLowerCase() === "fileid") continue;
    if (Number.isInteger(entry[id])) addCheckBox(id);
  }
};

const currentFileIDs = [];
let retriveFileIDsEnabled = false;
function retriveFileIDs(response) {
  currentFileIDs.splice(0, currentFileIDs.length);
  const listData = response.Cfw;
  for (const row of listData) {
    try {
      currentFileIDs.push(row[0].jsonId);
    } catch (error) {
      console.log(`FE:retriveFileIDs:${e}`);
    }
  }
  return retriveFileIDsEnabled;
}

function feFileIDs() {
  return currentFileIDs;
}
// export const feFileIDs = (data) => currentFileIDs;

const clearGlobalFileIDs = () => {
  globalFileIDs.splice(0, globalFileIDs.length);
};

const pushGlobalFileIDs = (fileID) => {
  globalFileIDs.push(fileID);
};

const getGlobalFileIDs = () => globalFileIDs;

const updateFeCurrentData = (data) => {
  currentDATA = data;
};
