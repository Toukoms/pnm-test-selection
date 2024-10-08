const TRUE_ANSWER_KEY = "true-answer";
const VALID_INPUT_KEY = "valid-input";
const INVALID_INPUT_KEY = "invalid-input";

let validInput = JSON.parse(localStorage.getItem(VALID_INPUT_KEY)) || [];
let invalidInput = JSON.parse(localStorage.getItem(INVALID_INPUT_KEY)) || [];

const inputMessage = document.getElementById("input-messages");
const revalidateButton = document.getElementById("revalidate-btn");
const saveBtn = document.getElementById("save-btn");
const exportBtn = document.getElementById("export-btn");

// -------------------------- Event Handlers ----------------------------- //

window.addEventListener("DOMContentLoaded", (e) => {
  if (invalidInput.length > 0) {
    showInTableInvalidInput();
    showErrorInfo();
  }
  if (localStorage.getItem(TRUE_ANSWER_KEY)) {
    const trueAnswers = JSON.parse(localStorage.getItem(TRUE_ANSWER_KEY));
    const trueAnswerInput = document.querySelectorAll(".true-answer-input");
    trueAnswerInput.forEach((input) => {
      input.value = trueAnswers[input.id.toUpperCase()].textFormat;
      input.style.filter = "blur(4px)";
      input.disabled = true;
    });
    saveBtn.textContent = "Modifier";
  }
});

inputMessage.addEventListener(
  "change",
  (e) => {
    // console.log(inputMessage.files[0]);
    const file = inputMessage.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      checkAndUpdateData(text);
    };
    reader.readAsText(file);
  },
  false
);

revalidateButton.addEventListener("click", (e) => {
  const messages = document.querySelectorAll(".msg");
  const changedMessage = [];
  messages.forEach((msg) => {
    // console.log(msg.textContent);
    changedMessage.push(msg.textContent);
  });
  checkAndUpdateData(changedMessage.join("\n"));
});

saveBtn.addEventListener("click", (e) => {
  if (
    localStorage.getItem(TRUE_ANSWER_KEY) &&
    saveBtn.textContent === "Modifier"
  ) {
    const trueAnswers = JSON.parse(localStorage.getItem(TRUE_ANSWER_KEY));
    const trueAnswerInput = document.querySelectorAll(".true-answer-input");
    trueAnswerInput.forEach((input) => {
      input.value = trueAnswers[input.id.toUpperCase()].textFormat;
      input.style.filter = "";
      input.disabled = false;
    });
    saveBtn.textContent = "Enregistrer";
  } else {
    validateAndSaveTrueAnswer();
  }
});

exportBtn.addEventListener("click", (e) => {
  const table2excel = new Table2Excel();
  table2excel.export(document.querySelectorAll("table"));
  localStorage.removeItem(INVALID_INPUT_KEY)
  window.location.reload();
});

// -------------------------- Functions ----------------------------- //

async function getData() {
  [fileHandler] = await window.showOpenFilePicker();
  let fileData = await fileHandler.getFile();
  textInput = await fileData.text();
  console.log(textInput);
}

/**
 *
 * @param {Array<string>} answer
 * @returns
 */
function convertAnswerFormat(answer) {
  const newAnswer = [];
  const uniqueQuestion = new Set();

  answer.forEach((t, i) => {
    newAnswer.push(["", ""]);
    for (let l of t) {
      if (/\d/.test(l)) {
        newAnswer[i][0] += l;
      } else {
        newAnswer[i][1] += l.toUpperCase();
      }
    }
    if (!uniqueQuestion.has(newAnswer[i][0])) {
      uniqueQuestion.add(newAnswer[i][0]);
    } else {
      throw new Error("Duplicate question: " + newAnswer[i][0]);
    }
  });

  return newAnswer;
}

function convertAnswerToMap(answer) {
  const map = {};
  answer.forEach((t) => {
    map[t[0]] = t[1];
  });
  return map;
}

function showErrorInfo() {
  if (invalidInput.length) {
    revalidateButton.classList.remove("hidden");
    exportBtn.classList.remove("hidden");
    const errorInfo = document.getElementById("error-info");
    errorInfo.classList.remove("hidden");
    errorInfo.textContent = `${invalidInput.length} données invalides ont besoins d'être rectifiées. Mais vous pouvez quand même voir les notes en cliquant sur le boutton "voir le résultat" à droite.`;
  }
}

/**
 *
 * @param {string} input
 */
function validateInput(input) {
  const valid = [];
  const invalid = [];
  const ids = new Set(JSON.parse(localStorage.getItem("ids")) || []);
  const lines = input.split("\n");
  let linesLength = lines.length;
  const pattern =
    /^([0-9]{3})-(FRS|CUG|LOG)-(?:([1-9]|10)[A-Da-d](?:, ?([1-9]|10)[A-Da-d]){0,9})?,?$/;
  console.log(linesLength);
  for (let i = 0; i < linesLength; i++) {
    let line = lines[i].trim(); // Remove leading/trailing spaces
    line = line.replace(/ /g, ""); // Remove spaces within the line
    line = line.toUpperCase(); // Convert the line to uppercase
    // clear each
    try {
      const msg = line.split(/[\p{P}]+/u);
      let id, subject, response;
      // check the ID
      if (/\d/.test(msg[0])) {
        id = msg.shift();
        subject = msg.shift();
      } else if (/\d/.test(msg[1])) {
        subject = msg.shift();
        id = msg.shift();
      } else {
        throw new Error("ID not found or not a number");
      }      
      
      // get question-answer as array
      response = msg;
      console.log(id, subject, response);

      // Check for the correct 3-digit ID
      if (!/^([0-9]{3}$)/.test(id.trim())) {
        throw new Error("Invalid ID format (must be 3 digits)");
      }

      // Check for valid subject
      if (!/^(FRS|CUG|LOG)$/.test(subject.trim())) {
        throw new Error("Invalid subject (must be FRS, CUG, or LOG)");
      }

      // Check for valid number-letter pairs
      const pairPart = response.join(",");
      if (
        !/^(?:([1-9]|10)[A-Da-d](?:, ?([1-9]|10)[A-Da-d]){0,9})?,?$/.test(
          pairPart.trim()
        )
      ) {
        // Specific checks for number-letter pairs
        if (response) {
          for (let pair of response) {
            if (!/^([1-9]|10)[A-Da-d]$/.test(pair.trim())) {
              throw new Error(`Invalid pair format: ${pair}`);
            }
          }
        }
        throw new Error("Invalid question-answer format");
      }

      const parsedMsg = id + "-" + subject + "-" + pairPart;
      // last checking format with the combination of regex
      if (!pattern.test(parsedMsg)) {
        throw new Error("incomprehensible");
      }

      // Convert to uppercase and format as needed for valid answer
      response = convertAnswerFormat(response);

      // Add the valid format to unique id
      if (!ids.has(id + subject)) {
        ids.add(id + subject);
      } else {
        console.error("Duplicate response " + id + subject);
        continue;
      }

      valid.push({ id, subject, response });

      // Update localStorage
      localStorage.setItem("ids", JSON.stringify(Array.from(ids)));
    } catch (error) {
      // console.error(error);
      invalid.push({ message: error.message, data: line });
      lines.splice(i, 1);
      i--;
      linesLength = lines.length;
    }
  }
  return { valid, invalid };
}

function showInTableInvalidInput() {
  const tableWrapper = document.getElementsByClassName("table-wrapper")[0];
  tableWrapper.classList.remove("hidden");
  const tableBody = document.querySelector(".table-flex tbody");
  tableBody.innerHTML = "";
  for (const input of invalidInput) {
    const tr = document.createElement("tr");
    const tdData = document.createElement("td");
    const tdErrorMsg = document.createElement("td");
    tdData.textContent = input.data;
    tdData.contentEditable = true;
    tdData.classList.add("msg");
    tdErrorMsg.textContent = input.message;
    tr.appendChild(tdData);
    tr.appendChild(tdErrorMsg);
    tableBody.appendChild(tr);
  }
}

function checkAndUpdateData(data) {
  const checkedData = validateInput(data);
  Array.prototype.push.apply(validInput, checkedData.valid);
  invalidInput = checkedData.invalid;
  // console.log(validInput);
  // console.log(invalidInput);
  localStorage.setItem(VALID_INPUT_KEY, JSON.stringify(validInput));
  localStorage.setItem(INVALID_INPUT_KEY, JSON.stringify(invalidInput));
  if (invalidInput.length > 0) {
    showInTableInvalidInput();
    showErrorInfo();
  }
}

function validateAndSaveTrueAnswer() {
  const trueAnswerInput = document.querySelectorAll(".true-answer-input");
  const validTrueAnswer = {}; // to store the valid format of the true answer provided
  let hasError = false;
  const pattern = /^(?:([1-9]|10)[A-Da-d],){9}([1-9]|10)[A-Da-d]$/;
  let invalidMessage = "Invalid format on: ";
  trueAnswerInput.forEach((answer) => {
    if (!pattern.test(answer.value.trim())) {
      hasError = true;
      invalidMessage += answer.id.toUpperCase() + " ";
    } else {
      const subject = answer.id.toUpperCase();
      const arrayAnswer = convertAnswerFormat(answer.value.trim().split(","));
      const trueAnswer = convertAnswerToMap(arrayAnswer);
      validTrueAnswer[subject] = trueAnswer;
      validTrueAnswer[subject].textFormat = answer.value.trim();
    }
  });
  if (hasError) {
    alert(invalidMessage);
  } else {
    localStorage.setItem(TRUE_ANSWER_KEY, JSON.stringify(validTrueAnswer));
    saveBtn.textContent = "Modifier";
    trueAnswerInput.forEach((input) => {
      input.disabled = true;
      input.style.filter = "blur(4px)";
    });
  }
}
