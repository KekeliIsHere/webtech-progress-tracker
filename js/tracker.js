/**
 * tracker.js
 * Handles data rendering, state updates, event delegation,
 * eligibility criteria, and metric calculation.
 */

document.addEventListener("DOMContentLoaded", function () {
  // 1. Session Guard
  const rawSession = localStorage.getItem("activeStudent");
  if (!rawSession) {
    window.location.href = "index.html";
    return;
  }
  const currentStudent = JSON.parse(rawSession);

  // Bind Navbar Identity
  document.getElementById("userName").textContent = currentStudent.name;
  document.getElementById("userId").textContent = `ID: ${currentStudent.id}`;

  // DOM Elements
  const tableBody = document.getElementById("trackerTableBody");
  const completedCountEl = document.getElementById("completedCount");
  const completionPercentageEl = document.getElementById("completionPercentage");
  const progressBarEl = document.getElementById("progressBar");
  const eligibleCountEl = document.getElementById("eligibleCount");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("searchInput");
  const logoutBtn = document.getElementById("logoutBtn");

  // State Variables
  const storageKey = `progress_${currentStudent.id}`;
  let currentFilter = "all";
  let searchQuery = "";
  let lessons = loadLessons();

  // Initial Paint
  render();

  // ----------------------------------------------------
  // Core Data Functions
  // ----------------------------------------------------

  function generateDefaultLessons() {
    const list = [];
    for (let i = 1; i <= 30; i++) {
      const paddedNum = i < 10 ? `0${i}` : `${i}`;
      // Seed first 8 lessons as completed as seen in spreadsheet
      const isPastLesson = i <= 8;
      list.push({
        id: i,
        title: `Lesson ${paddedNum}`,
        readingQuiz: isPastLesson,
        lab: isPastLesson,
        discussion: isPastLesson
      });
    }
    return list;
  }

  function loadLessons() {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Corrupted local data, re-initializing.");
      }
    }
    const defaults = generateDefaultLessons();
    saveLessons(defaults);
    return defaults;
  }

  function saveLessons(data) {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  /**
   * Evaluates if a student has unlocked the quiz for a lesson.
   * Requirement: Reading Quiz AND Lab must be checked.
   */
  function isEligible(lesson) {
    return Boolean(lesson.readingQuiz && lesson.lab);
  }

  /**
   * A lesson is complete when all three tasks are done.
   */
  function isFullyComplete(lesson) {
    return Boolean(lesson.readingQuiz && lesson.lab && lesson.discussion);
  }

  // ----------------------------------------------------
  // Analytics & Metrics Recalculation
  // ----------------------------------------------------
  function updateMetrics() {
    let completedCount = 0;
    let eligibleCount = 0;
    const total = lessons.length;

    for (let i = 0; i < total; i++) {
      if (isFullyComplete(lessons[i])) {
        completedCount++;
      }
      if (isEligible(lessons[i])) {
        eligibleCount++;
      }
    }

    const percentage = Math.round((completedCount / total) * 100);

    completedCountEl.textContent = completedCount;
    eligibleCountEl.textContent = eligibleCount;
    completionPercentageEl.textContent = `${percentage}%`;
    progressBarEl.style.width = `${percentage}%`;
  }

  // ----------------------------------------------------
  // Dynamic DOM Rendering
  // ----------------------------------------------------
  function render() {
    updateMetrics();

    // Filter and search pipeline
    const filtered = lessons.filter(lesson => {
      // Filter logic
      if (currentFilter === "eligible" && !isEligible(lesson)) return false;
      if (currentFilter === "pending" && isFullyComplete(lesson)) return false;

      // Search query logic
      if (searchQuery !== "") {
        return lesson.title.toLowerCase().includes(searchQuery);
      }
      return true;
    });

    tableBody.innerHTML = "";

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">No matching lessons found.</td>
        </tr>
      `;
      return;
    }

    filtered.forEach(lesson => {
      const eligible = isEligible(lesson);
      const row = document.createElement("tr");

      row.innerHTML = `
        <td class="cell-lesson-title"><strong>${lesson.title}</strong></td>
        <td>
          <input 
            type="checkbox" 
            class="task-check" 
            data-id="${lesson.id}" 
            data-key="readingQuiz" 
            ${lesson.readingQuiz ? "checked" : ""}
          >
        </td>
        <td>
          <input 
            type="checkbox" 
            class="task-check" 
            data-id="${lesson.id}" 
            data-key="lab" 
            ${lesson.lab ? "checked" : ""}
          >
        </td>
        <td>
          <input 
            type="checkbox" 
            class="task-check" 
            data-id="${lesson.id}" 
            data-key="discussion" 
            ${lesson.discussion ? "checked" : ""}
          >
        </td>
        <td>
          <span class="status-pill ${eligible ? "pill-eligible" : "pill-locked"}">
            ${eligible ? "Eligible" : "Locked"}
          </span>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  // ----------------------------------------------------
  // Event Delegation for Table Checkboxes
  // ----------------------------------------------------
  tableBody.addEventListener("change", function (event) {
    if (event.target.classList.contains("task-check")) {
      const checkbox = event.target;
      const lessonId = parseInt(checkbox.dataset.id, 10);
      const taskKey = checkbox.dataset.key;

      // Locate target lesson in state
      const targetLesson = lessons.find(item => item.id === lessonId);
      if (targetLesson) {
        targetLesson[taskKey] = checkbox.checked;
        saveLessons(lessons);
        render(); // Re-render to update badges and metric deck
      }
    }
  });

  // ----------------------------------------------------
  // Controls & Interactions
  // ----------------------------------------------------
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    render();
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("activeStudent");
    window.location.href = "index.html";
  });
});