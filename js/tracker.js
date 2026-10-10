document.addEventListener("DOMContentLoaded", function () {
  // Guard check: Must have an active session
  const sessionData = localStorage.getItem("activeStudent");
  if (!sessionData) {
    window.location.href = "index.html";
    return;
  }
  const currentStudent = JSON.parse(sessionData);

  // Bind student identity to UI
  document.getElementById("userName").textContent = currentStudent.name;
  document.getElementById("userId").textContent = `ID: ${currentStudent.id}`;

  // Unique data key scoped to THIS student
  const studentStorageKey = `tracker_data_${currentStudent.id}`;

  // DOM Elements
  const tableBody = document.getElementById("trackerTableBody");
  const completedCountEl = document.getElementById("completedCount");
  const completionPercentageEl = document.getElementById("completionPercentage");
  const progressBarEl = document.getElementById("progressBar");
  const eligibleCountEl = document.getElementById("eligibleCount");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("searchInput");
  const logoutBtn = document.getElementById("logoutBtn");

  let currentFilter = "all";
  let searchQuery = "";
  let lessons = loadStudentData();

  render();

  // Load existing data or initialize fresh records
  function loadStudentData() {
    const saved = localStorage.getItem(studentStorageKey);
    if (saved) {
      return JSON.parse(saved);
    }

    // Default generator
    const freshData = [];
    // Demo accounts (like yours) get pre-filled progress; new registrations start blank
    const isSeedUser = currentStudent.id === "45862028";

    for (let i = 1; i <= 30; i++) {
      const num = i < 10 ? `0${i}` : `${i}`;
      const defaultState = isSeedUser && i <= 8;

      freshData.push({
        id: i,
        title: `Lesson ${num}`,
        readingQuiz: defaultState,
        lab: defaultState,
        discussion: defaultState,
        terminalQuiz: defaultState
      });
    }

    localStorage.setItem(studentStorageKey, JSON.stringify(freshData));
    return freshData;
  }

  function saveStudentData() {
    localStorage.setItem(studentStorageKey, JSON.stringify(lessons));
  }

  // Rules
  function checkEligibility(l) {
    return Boolean(l.readingQuiz && l.lab && l.discussion);
  }

  function checkLessonStatus(l) {
    return Boolean(checkEligibility(l) && l.terminalQuiz);
  }

  function updateMetrics() {
    let completed = 0;
    let eligible = 0;

    for (let i = 0; i < lessons.length; i++) {
      if (checkLessonStatus(lessons[i])) completed++;
      if (checkEligibility(lessons[i])) eligible++;
    }

    const pct = Math.round((completed / lessons.length) * 100);
    completedCountEl.textContent = completed;
    eligibleCountEl.textContent = eligible;
    completionPercentageEl.textContent = `${pct}%`;
    progressBarEl.style.width = `${pct}%`;
  }

  function render() {
    updateMetrics();

    const filtered = lessons.filter(l => {
      const isEligible = checkEligibility(l);
      const isComplete = checkLessonStatus(l);

      if (currentFilter === "eligible" && !isEligible) return false;
      if (currentFilter === "completed" && !isComplete) return false;
      if (currentFilter === "incomplete" && isComplete) return false;

      if (searchQuery !== "") {
        return l.title.toLowerCase().includes(searchQuery);
      }
      return true;
    });

    tableBody.innerHTML = "";

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No matching lessons found.</td></tr>`;
      return;
    }

    filtered.forEach(l => {
      const isEligible = checkEligibility(l);
      const isComplete = checkLessonStatus(l);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="cell-lesson-title"><strong>${l.title}</strong></td>
        <td>
          <input type="checkbox" class="task-check" data-id="${l.id}" data-key="readingQuiz" ${l.readingQuiz ? "checked" : ""}>
        </td>
        <td>
          <input type="checkbox" class="task-check" data-id="${l.id}" data-key="lab" ${l.lab ? "checked" : ""}>
        </td>
        <td>
          <input type="checkbox" class="task-check" data-id="${l.id}" data-key="discussion" ${l.discussion ? "checked" : ""}>
        </td>
        <td>
          <span class="status-pill ${isEligible ? "pill-eligible" : "pill-locked"}">
            ${isEligible ? "Eligible" : "Locked"}
          </span>
        </td>
        <td>
          <input type="checkbox" class="task-check" data-id="${l.id}" data-key="terminalQuiz" 
            ${l.terminalQuiz ? "checked" : ""} 
            ${!isEligible ? "disabled" : ""}>
        </td>
        <td>
          <span class="status-pill ${isComplete ? "pill-complete" : "pill-progress"}">
            ${isComplete ? "Completed" : "In Progress"}
          </span>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Event Delegation: Save on every click
  tableBody.addEventListener("change", function (e) {
    if (e.target.classList.contains("task-check")) {
      const id = parseInt(e.target.dataset.id, 10);
      const key = e.target.dataset.key;
      const lesson = lessons.find(item => item.id === id);

      if (lesson) {
        lesson[key] = e.target.checked;

        // If prerequisite unchecked, lock terminal quiz
        if (!checkEligibility(lesson)) {
          lesson.terminalQuiz = false;
        }

        saveStudentData();
        render();
      }
    }
  });

  // Filter and Search Event Handlers
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  searchInput.addEventListener("input", e => {
    searchQuery = e.target.value.toLowerCase().trim();
    render();
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("activeStudent");
    window.location.href = "index.html";
  });
});