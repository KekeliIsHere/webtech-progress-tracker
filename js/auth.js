/**
 * auth.js
 * Asynchronous user check with automatic self-registration.
 */

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const studentIdInput = document.getElementById("studentId");
  const statusMessage = document.getElementById("statusMessage");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const spinner = submitBtn.querySelector(".spinner");

  // Check if session already active
  const activeUser = localStorage.getItem("activeStudent");
  if (activeUser) {
    displayMessage("Session active. Redirecting...", "info");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 500);
    return;
  }

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const inputId = studentIdInput.value.trim();

    if (inputId === "") {
      displayMessage("Please enter a valid Student ID.", "error");
      studentIdInput.focus();
      return;
    }

    setLoadingState(true);
    displayMessage("Querying student database...", "info");

    let isSuccess = false;

    try {
      // 1. Fetch seed database asynchronously
      let database = [];
      try {
        const response = await fetch("data/students.json");
        if (response.ok) {
          database = await response.json();
        }
      } catch (err) {
        console.warn("Could not reach data/students.json seed, falling back to local store.");
      }

      // 2. Read local registry override if it exists
      const localRegistry = JSON.parse(localStorage.getItem("allStudents")) || [];
      
      // Merge databases (giving priority to locally saved updates)
      const mergedMap = new Map();
      database.forEach(s => mergedMap.set(s.id, s));
      localRegistry.forEach(s => mergedMap.set(s.id, s));
      const allStudents = Array.from(mergedMap.values());

      // 3. Search for existing student
      let currentStudent = allStudents.find(s => s.id === inputId);

      if (currentStudent) {
        displayMessage(`Welcome back, ${currentStudent.name}! Loading data...`, "success");
      } else {
        // Auto-create profile if not found
        currentStudent = {
          id: inputId,
          name: `Student ${inputId}`,
          role: "Student",
          created: new Date().toISOString()
        };
        allStudents.push(currentStudent);
        localStorage.setItem("allStudents", JSON.stringify(allStudents));
        displayMessage(`New ID detected. Created profile for ${inputId}!`, "success");
      }

      // 4. Save session and route to tracker
      localStorage.setItem("activeStudent", JSON.stringify(currentStudent));
      isSuccess = true;

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 700);

    } catch (error) {
      console.error("Auth processing failure:", error);
      displayMessage("An unexpected error occurred. Please try again.", "error");
    } finally {
      if (!isSuccess) {
        setLoadingState(false);
      }
    }
  });

  function displayMessage(text, type) {
    statusMessage.textContent = text;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.style.display = "block";
  }

  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      btnText.textContent = "Processing...";
      if (spinner) spinner.hidden = false;
    } else {
      submitBtn.disabled = false;
      btnText.textContent = "Open Tracker";
      if (spinner) spinner.hidden = true;
    }
  }
});