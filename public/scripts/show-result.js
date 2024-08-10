const TRUE_ANSWER_KEY = "true-answer";
const VALID_INPUT_KEY = "valid-input";
const trueAnswer = JSON.parse(localStorage.getItem(TRUE_ANSWER_KEY));
const localValidInput = JSON.parse(localStorage.getItem(VALID_INPUT_KEY));
const detailModal = document.getElementById("detail-modal");
const closeBtn = document.getElementById("close-btn");

function calculateNote(validInput, trueAnswer) {
  const notes = [];
  const ids = new Set();
  // Calculate the note based on the validInput and store it in localStorage
  validInput.forEach((data) => {
    let note;
    if (!ids.has(data.id)) {
      ids.add(data.id);
      note = {
        id: data.id,
        FRC: { qaNotes: [], total: 0 },
        CUG: { qaNotes: [], total: 0 },
        LOG: { qaNotes: [], total: 0 },
        total: 0,
      };
      notes.push(note);
    } else {
      note = notes.filter((n) => n.id === data.id)[0];
    }
    let totalPoint = 0;
    data.response.forEach((r) => {
      if (trueAnswer[data.subject][r[0].toString()] === r[1]) {
        totalPoint += 2;
        note[data.subject].qaNotes.push([r[0], r[1], "2"]);
      } else {
        totalPoint -= 1;
        note[data.subject].qaNotes.push([r[0], r[1], "-1"]);
      }
    });
    note[data.subject].total = totalPoint;
    note.total = note.FRC.total + note.CUG.total + note.LOG.total;
  });
  localStorage.setItem("notes", JSON.stringify(notes));
  return notes;
}
