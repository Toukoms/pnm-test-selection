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

  answer.forEach((t, i) => {
    newAnswer.push(["", ""]);
    for (let l of t) {
      if (/\d/.test(l)) {
        newAnswer[i][0] += l;
      } else {
        newAnswer[i][1] += l.toUpperCase();
      }
    }
  });

  return newAnswer;
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
    /^([0-9]{3})-(FRC|CUG|LOG)-(?:([1-9]|10)[A-Da-d](?:, ?([1-9]|10)[A-Da-d]){0,9})?,?$/;
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

      // Check for the correct 3-digit ID
      if (!/^([0-9]{3})/.test(id.trim())) {
        throw new Error("Invalid number format (must be 3 digits)");
      }

      // Check for valid subject
      if (!/(FRC|CUG|LOG)/.test(subject.trim())) {
        throw new Error("Invalid subject (must be FRC, CUG, or LOG)");
      }

      // Check for valid number-letter pairs
      const pairPart = response.join(",");
      console.log(pairPart);
      if (
        !/(?:([1-9]|10)[A-Da-d](?:, ?([1-9]|10)[A-Da-d]){0,9})?,?$/.test(
          pairPart.trim()
        )
      ) {
        // Specific checks for number-letter pairs
        if (response) {
          for (let pair of response ){
            if (!/^([1-9]|10)[A-Da-d]$/.test(pair.trim())) {
              throw new Error(`Invalid pair format: ${pair}`);
            }
          }
        }
        throw new Error("Invalid question-answer format");
      }

      // last checking format with the combination of regex
      if (!pattern.test(line)) {
        throw new Error("Invalid format, incomprehensible");
      }

      // Add the valid format to unique id
      if (!ids.has(id + subject)) {
        ids.add(id + subject);
      } else {
        throw new Error("Duplicate response " + id + subject);
      }

      // Convert to uppercase and format as needed for valid answer
      response = convertAnswerFormat(response);

      valid.push({ id, subject, response });

      // Update localStorage
      localStorage.setItem("ids", JSON.stringify(Array.from(ids)));
    } catch (error) {
      // console.log(error);
      invalid.push({ message: error.message, data: line });
      lines.splice(i, 1);
      i--;
      linesLength = lines.length;
    }
  }
  return { valid, invalid };
}

const TRUE_ANSWER_KEY = "true-answer";
const VALID_INPUT_KEY = "valid-input";
const INVALID_INPUT_KEY = "invalid-input";

let validInput = JSON.parse(localStorage.getItem(VALID_INPUT_KEY)) || [];
let invalidInput = JSON.parse(localStorage.getItem(INVALID_INPUT_KEY)) || [];

const inputMessage = document.getElementById("input-messages");

inputMessage.addEventListener(
  "change",
  (e) => {
    // console.log(inputMessage.files[0]);
    const file = inputMessage.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      checkedData = validateInput(text);
      Array.prototype.push.apply(validInput, checkedData.valid);
      invalidInput = checkedData.invalid;
      console.log(validInput);
      console.log(invalidInput);
      localStorage.setItem(VALID_INPUT_KEY, JSON.stringify(validInput));
      localStorage.setItem(INVALID_INPUT_KEY, JSON.stringify(invalidInput));
    };
    reader.readAsText(file);
  },
  false
);
