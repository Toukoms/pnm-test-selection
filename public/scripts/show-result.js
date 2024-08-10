const TRUE_ANSWER_KEY = "true-answer";
const VALID_INPUT_KEY = "valid-input";
const trueAnswer = JSON.parse(localStorage.getItem(TRUE_ANSWER_KEY));
const localValidInput = JSON.parse(localStorage.getItem(VALID_INPUT_KEY));
const detailModal = document.getElementById("detail-modal");
const closeBtn = document.getElementById("close-btn");

if (localValidInput && trueAnswer) {
  const notes =
    JSON.parse(localStorage.getItem("notes")) ||
    calculateNote(localValidInput, trueAnswer);

  notes.sort((a, b) => b.total - a.total);
  if (notes) {
    showResult(notes);
    const idsElement = document.querySelectorAll(".id-note");
    idsElement.forEach((element) => {
      element.addEventListener("click", (e) => {
        detailModal.classList.remove("hidden");
        const noteId = element.id;
        const note = notes.filter((n) => n.id === noteId)[0];
        const headerModal = document.getElementById("header-modal");
        headerModal.textContent = `Détail de Note - ID: ${noteId}`;
        const tableWrapperModal = document.getElementById(
          "table-wrapper-modal"
        );
        tableWrapperModal.innerHTML = "";
        const subjects = ["FRC", "CUG", "LOG"];
        subjects.forEach((subject) => {
          const table = document.createElement("table");
          table.classList.add("table-flex");
          table.style.border = "1px solid #40404060";
          // Create the table header
          const thead = document.createElement("thead");
          const trHead = document.createElement("tr");
          const thSubject = document.createElement("th");
          thSubject.textContent = subject;
          thSubject.style.position = "static";
          trHead.appendChild(thSubject);
          let questions = Object.keys(trueAnswer[subject]);
          questions = questions.filter((question) => question != "textFormat");
          questions.push("Total");
          questions.forEach((question) => {
            const th = document.createElement("th");
            th.textContent = question;
            th.style.color = "black";
            th.style.position = "static";
            trHead.appendChild(th);
          });
          questions.pop();
          thead.appendChild(trHead);
          // Create the table body
          const tbody = document.createElement("tbody");
          // Display the true answer line in table
          const trTrueAnswer = document.createElement("tr");
          trTrueAnswer.innerHTML = "<td>VR</td>";
          questions.forEach((question) => {
            const td = document.createElement("td");
            td.textContent = trueAnswer[subject][question];
            trTrueAnswer.appendChild(td);
          });
          tbody.appendChild(trTrueAnswer);
          // Display the student answer lines in table
          const trAnswer = document.createElement("tr");
          const trPoint = document.createElement("tr");
          trAnswer.innerHTML = "<td>R</td>";
          trPoint.innerHTML = "<td>Point</td>";
          questions.forEach((question) => {
            const tdAnswer = document.createElement("td");
            const tdPoint = document.createElement("td");
            const answer = note[subject].qaNotes.filter(
              (qa) => qa[0] === question
            )[0] || [null, "0", "0"];
            tdAnswer.textContent = answer[1];
            tdPoint.textContent = answer[2];
            if (answer[2] === "2") {
              tdAnswer.style.color = "green";
              tdPoint.style.color = "green";
            } else if (answer[2] === "-1") {
              tdAnswer.style.color = "red";
              tdPoint.style.color = "red";
            }
            trAnswer.appendChild(tdAnswer);
            trPoint.appendChild(tdPoint);
          });
          const tdTotalSubject = document.createElement("td");
          tdTotalSubject.textContent = note[subject].total;
          tdTotalSubject.rowSpan = 3;
          trTrueAnswer.appendChild(tdTotalSubject);
          tbody.appendChild(trAnswer);
          tbody.appendChild(trPoint);
          // Append the thead and the tbody to the table
          table.appendChild(thead);
          table.appendChild(tbody);
          // Append the table to the table wrapper
          tableWrapperModal.appendChild(table);
        });
      });
    });
  }
}

// -------------------------- Event Handlers ----------------------------- //

closeBtn.addEventListener("click", (e) => {
  detailModal.classList.add("hidden");
});

window.addEventListener("click", (event) => {
  if (event.target == detailModal) {
    detailModal.classList.add("hidden");
  }
});

// -------------------------- Functions ----------------------------- //

function showResult(notes) {
  const errMsg = document.getElementById("note-null");
  errMsg.style.display = "none";
  const backLink = document.getElementById("back-link");
  backLink.classList.remove("hidden");
  const tableWrapper = document.getElementsByClassName("table-wrapper")[0];
  tableWrapper.classList.remove("hidden");
  const tableBody = document.querySelector(".table-flex tbody");
  notes.forEach((note) => {
    const tr = document.createElement("tr");
    const tdId = document.createElement("td");
    const tdFRC = document.createElement("td");
    const tdCUG = document.createElement("td");
    const tdLOG = document.createElement("td");
    const tdTotal = document.createElement("td");
    tdId.id = note.id;
    tdId.classList.add("id-note");
    tdId.textContent = note.id;
    tdFRC.textContent = note.FRC.total || "0";
    tdCUG.textContent = note.CUG.total || "0";
    tdLOG.textContent = note.LOG.total || "0";
    tdTotal.textContent = note.total;
    tr.style.color = "#404040";
    tr.appendChild(tdId);
    tr.appendChild(tdFRC);
    tr.appendChild(tdCUG);
    tr.appendChild(tdLOG);
    tr.appendChild(tdTotal);
    tableBody.appendChild(tr);
  });
}

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
