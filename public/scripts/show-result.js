const TRUE_ANSWER_KEY = "true-answer";
const VALID_INPUT_KEY = "valid-input";
const trueAnswer = JSON.parse(localStorage.getItem(TRUE_ANSWER_KEY));
const validInput = JSON.parse(localStorage.getItem(VALID_INPUT_KEY));

if (validInput && trueAnswer) {
  const note = JSON.parse(localStorage.getItem('note')) || calculateNote(validInput);
  showResult(note);
}



