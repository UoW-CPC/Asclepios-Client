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

const resetNotify = (elementId = "notify-fe") => {
  document.getElementById(elementId).innerHTML = "";
};
const notify = (text, elementId = "notify-fe", truncate = 192) => {
  try {
    document.getElementById(elementId).innerHTML = `${
      document.getElementById(elementId).innerHTML
    }<div class='alert-primary alert'>${text_truncate(text, truncate)}</div>`;
  } catch (error) {
    console.log(text);
  }
};

const notifyAnalyst = (text) => {
  notify(text, "notify-analyst", 512);
};

const informAnalyst = (text) => {
  try {
    document.getElementById("info-analyst").innerHTML = text_truncate(
      text,
      512
    );
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

const encryptDataAndSendFE = (dataWithIDs, currentDateTime, encryptNotify) => {
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
        if (
          !!results.fileIDsExists &&
          results.fileIDsExists.length > 0 &&
          !!encryptNotify
        ) {
          encryptNotify(
            `FE fileIDs exists:${JSON.stringify(results.fileIDsExists)}`
          );
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
              const currentField = id.split("@")[1];
              // const currentDateTime =
              //   Object.keys(currentDateFormats).indexOf(currentField) >= 0
              //     ? currentDateFormats[currentField]
              //     : null;
              dataWithIDs[id] =
                !Number.isInteger(dataWithIDs[id]) &&
                !!convertDateTimeToUnixTimestamp(
                  dataWithIDs[id],
                  currentDateTime
                )
                  ? convertDateTimeToUnixTimestamp(
                      dataWithIDs[id],
                      currentDateTime
                    )
                  : dataWithIDs[id];

              if (!!Number.isInteger(dataWithIDs[id])) {
                encryptedData[id] = dataWithIDs[id] + feKeys[id];
              }

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
              if (!!encryptNotify) {
                encryptNotify(
                  `FE Ciphertexts:${JSON.stringify(encryptedData)}`
                );
              }
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
    currentDateFormats = {};
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

const computeFE = (fileIDs, field, operator, notifyAnalyst) => {
  // Checks if fields are filled-in or not, returns response "<p>Please enter your details.</p>" if not.
  if (!fileIDs || fileIDs.length === 0 || field == "" || operator == "") {
    // notifyAnalyst("Please enter your details.");
    if (!!notifyAnalyst) notifyAnalyst(`${operator}=0`);
    return 0;
  }

  const computeBodyRequest = {
    fileIDs: fileIDs,
    field,
    function: operator,
  };
  return fetch(`http://${feConfig.url_ta}/compute`, {
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
                if (!!notifyAnalyst) notifyAnalyst(`${operator}:${results}`);
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
        if (!!notifyAnalyst) {
          try {
            notifyAnalyst((await response.json()).message);
          } catch (error) {
            notifyAnalyst("Something went wrong!!!");
          }
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

  var keyid = $("#fe-keyid").val();

  var jsonObj = JSON.parse(event.target.result);

  var st_date = new Date();
  var st_time = st_date.getTime();

  retriveFileIDsEnabled = true;
  var results = search(jsonObj, KeyG, Kenc, keyid);

  if (results == null) {
    message = "Invalid input file";
  } else message = results["count"];

  var end_date = new Date();
  var end_time = end_date.getTime();
  var diff = end_time - st_time;

  console.log("Found results:", results);

  const field = document.getElementById("fe-analyst-field").value;
  const operator = encodeURIComponent(
    document.getElementById("fe-analyst-function").value
  );
  const fileIDs = feFileIDs();
  if (!fileIDs || fileIDs.length === 0 || field == "" || operator == "") {
    notifyAnalyst("Please enter your details.");
  } else {
    computeFE(fileIDs.sort(), field, operator, notifyAnalyst);
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

    const field = document.getElementById("fe-analyst-field").value;
    const operator = encodeURIComponent(
      document.getElementById("fe-analyst-function").value
    );
    computeFE(
      fileIDs.replace(" ", "").split(","),
      field,
      operator,
      notifyAnalyst
    );
  }

  // formsubmission.preventDefault();
};
const feDeleteData = (fileIDs, deleteCallback) => {
  if (!Array.isArray(fileIDs)) {
    fileIDs = [fileIDs];
  }
  fetch(`http://${feConfig.url_ta}/delete`, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileIDs }),
  })
    .then(async function (response) {
      try {
        const results = await response.json();
        console.log(results);
        if (!!deleteCallback) {
          await deleteCallback(results);
        } else if (!!notify) {
          const { deletedList } = results;
          notify(
            `FE Keys/Values deleted list:${deletedList}`,
            "fe-delete-message"
          );
        }
      } catch (e) {
        console.log(e);
      }
    })
    .catch(function (error) {
      console.error(error);
    });
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

  document
    .getElementById("jsonUpdateFile")
    .addEventListener("change", function (e) {
      var fr = new FileReader();
      fr.onload = function () {
        const jsonObj = JSON.parse(fr.result);
        const convertedJsonObj = Object.keys(jsonObj).reduce((results, key) => {
          results[key] = jsonObj[key][1];
          return results;
        }, {});
        dateTimeFormatChecker(convertedJsonObj);
      };
      fr.readAsText(this.files[0]);
    });

  document
    .getElementById("fe-analyst-function")
    .addEventListener("change", function (e) {
      if (document.getElementById("fe-analyst-function").value === "subtract") {
        informAnalyst(
          "<b>*Subtract needs at least 1 file ID and 2 fields  or  2 file IDs and 1 field</b>"
        );
      } else {
        informAnalyst("");
      }
    });

  // document
  //   .getElementById("btnSubmitFile")
  //   .addEventListener("click", function (e) {
  //     submitFEData(e);
  //   });

  document
    .getElementById("fe-analyst-compute")
    .addEventListener("click", fePostComputeData);

  window.deleteData = (function (_super) {
    return function () {
      // Extend it to log the value for example that is passed
      // console.log(arguments[0]);
      // arguments[0] = arguments[0] - 1;
      // const te=arguments[1];
      // delete arguments[1];
      // arguments[1] = (data) => {
      //   te(data);
      //   console.log(`2:${data}`);
      // };
      //(file_id, sharedKey, Kenc, keyid, callback)
      const file_id = arguments[0];
      const origCallback = arguments[4];
      if (!!origCallback) {
        delete arguments[4];
      }
      arguments[4] = (data) => {
        if (!!origCallback) origCallback(data);
        console.log(`fe-->callback:${file_id}`);
        feDeleteData(file_id);
      };
      arguments.length = arguments.length + 1;

      // var current_del, current_objects, current_deleted_objects;
      // [current_del, current_objects, current_deleted_objects] = updateFileNo(
      //   Lw,
      //   LfileNoUri,
      //   LfileNo,
      //   -1,
      //   keyid
      // );

      // const sseUpdateFileNo = updateFileNo; //(sseConfig.base_url_ta + "/api/v1/fileno/", data, callback);;
      // updateFileNo = (Lhash, LfileNoUri, LfileNo, offset, keyid) => {
      //   let current_del, current_objects, current_deleted_objects;
      //   [
      //     current_del,
      //     current_objects,
      //     current_deleted_objects,
      //   ] = sseUpdateFileNo(Lhash, LfileNoUri, LfileNo, offset, keyid);
      //   currentLhash = Lhash;
      //   return [current_del, current_objects, current_deleted_objects];
      // };

      const returnDeleteData = _super.apply(this, arguments);

      // console.log(`fe:returnDeleteData:${returnDeleteData}`);
      // updateFileNo = sseUpdateFileNo;
      return returnDeleteData;
    };
  })(window.deleteData);

  const feUpdateData = (jsonObj, file_id, dateTimeFormat, updateNotify) => {
    const keys = Object.keys(jsonObj);
    const values = Object.values(jsonObj);
    const dataWithIDs = {};
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      const value = values[index][1];
      dataWithIDs[`${file_id}@${key}`] = value;
    }
    feDeleteData(Object.keys(dataWithIDs), async (results) => {
      const { deletedList } = results;
      if (!!deletedList && deletedList.length > 0) {
        const deletedListWithData = {};
        for (const key in dataWithIDs) {
          if (dataWithIDs.hasOwnProperty(key)) {
            const currentValue = dataWithIDs[key];
            if (deletedList.includes(key)) {
              deletedListWithData[key] = currentValue;
            }
          }
        }
        encryptDataAndSendFE(deletedListWithData, dateTimeFormat, (message) => {
          updateNotify(message);
        });
      }
    });
  };

  window.updateData = (function (_super, updateData) {
    return function () {
      try {
        let data = [];
        // Extend it to log the value for example that is passed
        // console.log(arguments[0]);
        // arguments[0] = arguments[0] - 1;
        // const te=arguments[1];
        // delete arguments[1];
        // arguments[1] = (data) => {
        //   te(data);
        //   console.log(`2:${data}`);
        // };
        //(file_id, sharedKey, Kenc, keyid, callback)
        const rawData = arguments[0];
        const file_id = arguments[1];
        const origCallback = arguments[5];
        if (!!origCallback) {
          delete arguments[5];
        }
        arguments[5] = (data) => {
          if (!!origCallback) origCallback(data);
          console.log(`fe-->callback:update:${data}`);
          // feDeleteData(file_id);

          const updateDataDateFormat = document.getElementById(
            "fe-datetime-format-update"
          ).value;
          feUpdateData(rawData, file_id, updateDataDateFormat, (message) =>
            notify(message, "update-fe-notify")
          );
          // feDeleteData(file_id, async (results) => {
          //   const keys = Object.keys(rawData);
          //   const values = Object.values(rawData);
          //   const dataWithIDs = {};
          //   for (let index = 0; index < keys.length; index++) {
          //     const key = keys[index];
          //     const value = values[index][1];
          //     dataWithIDs[`${file_id}@${key}`] = value;
          //   }
          //   if (!!dataWithIDs && Object.keys(dataWithIDs).length > 0) {
          //     encryptDataAndSendFE(dataWithIDs);
          //   }
          // });
        };
        arguments.length = arguments.length + 1;

        const returnDeleteData = _super.apply(this, arguments);
        return returnDeleteData;
      } catch (e) {
        console.log(e);
      }
    };
  })(window.updateData);
})();

const submitFEData = (e) => {
  resetNotify();
  console.log(currentDATA);
  parseInput(currentDATA, getFeFieldChooses());
  console.log(feKeysBodyRequest);
  console.log(dataWithIDs);
  const currentDateFormat = document.getElementById("fe-datetime-format").value;
  encryptDataAndSendFE(dataWithIDs, currentDateFormat, notify);
};

let currentDateFormats = {};
const dateTimeFormats = [
  "D-M-Y hh:mm:ss",
  "D/M/Y hh:mm:ss",
  "M-D-Y hh:mm:ss",
  "M/D/Y hh:mm:ss",
  "Y-D-M hh:mm:ss",
  "Y/D/M hh:mm:ss",
  "Y-M-D hh:mm:ss",
  "Y/M/D hh:mm:ss",

  "D-M-Y HH:mm:ss",
  "D/M/Y HH:mm:ss",
  "M-D-Y HH:mm:ss",
  "M/D/Y HH:mm:ss",
  "Y-D-M HH:mm:ss",
  "Y/D/M HH:mm:ss",
  "Y-M-D HH:mm:ss",
  "Y/M/D HH:mm:ss",
];

const convertDateTimeToUnixTimestamp = (stringDateTime, format) => {
  if (!!format) {
    return parseInt(moment(stringDateTime, format, true).format("X"));
  }
  for (const dateTimeFormat of dateTimeFormats) {
    const currentTimestamp = moment(
      stringDateTime,
      dateTimeFormat,
      true
    ).format("X");
    if (!!parseInt(currentTimestamp)) {
      return parseInt(currentTimestamp);
    }
  }
  return;
};

const checkDateTime = (stringDateTime) => {
  for (const dateTimeFormat of dateTimeFormats) {
    const currentTimestamp = moment(
      stringDateTime,
      dateTimeFormat,
      true
    ).format("X");
    if (!!parseInt(currentTimestamp)) {
      return dateTimeFormat;
    }
  }
  return null;
};

const dateTimeFormatChecker = (entries) => {
  console.log(entries);
  for (const id in entries) {
    if (id.toLowerCase() === "fileid") continue;
    const currentDateTimeFormat = checkDateTime(entries[id]);
    if (!!currentDateTimeFormat) {
      currentDateFormats[id] = currentDateTimeFormat;
    }
  }
  const dateTimeFormatParentEls = document.getElementsByClassName(
    "fe-datetime-format-update"
  );
  if (!!currentDateFormats && Object.keys(currentDateFormats).length > 0) {
    Object.values(dateTimeFormatParentEls).forEach((element) => {
      element.setAttribute("style", "display:true");
    });
    document.getElementById("fe-datetime-format-update").value = Object.values(
      currentDateFormats
    )
      .reduce((results, value) => {
        if (!!value) results.push(value);
        return results;
      }, [])
      .join(",");
  } else {
    Object.values(dateTimeFormatParentEls).forEach((element) => {
      element.setAttribute("style", "display:none");
    });
  }
};

const loopThroughKeys = (entry) => {
  console.log(entry);
  for (const id in entry) {
    if (id.toLowerCase() === "fileid") continue;
    const currentDateTimeFormat = checkDateTime(entry[id]);
    if (Number.isInteger(entry[id]) || !!currentDateTimeFormat) {
      addCheckBox(id);
      currentDateFormats[id] = currentDateTimeFormat;
    }
  }
  const dateTimeFormatEl = document.getElementById("fe-checkbox")
    .nextElementSibling;
  if (currentDateFormats != null) {
    dateTimeFormatEl.setAttribute("style", "display:true");
    document.getElementById("fe-datetime-format").value = Object.values(
      currentDateFormats
    )
      .reduce((results, value) => {
        if (!!value) results.push(value);
        return results;
      }, [])
      .join(",");
  } else {
    dateTimeFormatEl.setAttribute("style", "display:none");
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
