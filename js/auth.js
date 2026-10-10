document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const studentIdInput = document.getElementById("studentId");
  const nameGroup = document.getElementById("nameGroup");
  const studentNameInput = document.getElementById("studentName");
  const statusMessage = document.getElementById("statusMessage");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn.querySelector(".btn-text");

  // Clear any existing active session when visiting the login screen
  localStorage.removeItem("activeStudent");

  // Reset name input visibility whenever the user modifies the ID field
  studentIdInput.addEventListener("input", function () {
    if (!nameGroup.classList.contains("is-hidden")) {
      nameGroup.classList.add("is-hidden");
      studentNameInput.value = "";
      btnText.textContent = "Access Tracker";
      statusMessage.style.display = "none";
    }
  });

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const id = studentIdInput.value.trim();
    const name = studentNameInput.value.trim();

    if (id === "") {
      showMessage("Please enter your Student ID.", "error");
      studentIdInput.focus();
      return;
    }

    // 1. Fetch seed student list asynchronously
    let seedStudents = [];
    try {
      const response = await fetch("data/students.json");
      if (response.ok) {
        seedStudents = await response.json();
      }
    } catch (err) {
      console.warn("Could not read students.json, checking local storage only.");
    }

    // 2. Read locally registered new profiles
    const localStudents = JSON.parse(localStorage.getItem("registeredStudents")) || [];
    const allStudents = [...seedStudents, ...localStudents];

    // 3. Search for matching student
    let foundStudent = null;
    for (let i = 0; i < allStudents.length; i++) {
      if (allStudents[i].id === id) {
        foundStudent = allStudents[i];
        break;
      }
    }

    // 4. Branching logic: Existing vs New Student
    if (foundStudent) {
      // User exists -> Log in directly
      localStorage.setItem("activeStudent", JSON.stringify(foundStudent));
      showMessage(`Welcome back, ${foundStudent.name}! Loading your tracker...`, "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 600);

    } else if (nameGroup.classList.contains("is-hidden")) {
      // New user step 1 -> Reveal name input field
      nameGroup.classList.remove("is-hidden");
      studentNameInput.focus();
      btnText.textContent = "Register & Enter";
      showMessage("ID not found in registry. Enter your name to register.", "info");

    } else {
      // New user step 2 -> Validate name and register
      if (name === "") {
        showMessage("Please provide your name to complete registration.", "error");
        studentNameInput.focus();
        return;
      }

      const newStudent = { id: id, name: name, role: "Student" };
      localStudents.push(newStudent);
      localStorage.setItem("registeredStudents", JSON.stringify(localStudents));
      localStorage.setItem("activeStudent", JSON.stringify(newStudent));

      showMessage(`Registration complete for ${name}! Initializing fresh tracker...`, "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 600);
    }
  });

  function showMessage(text, type) {
    statusMessage.textContent = text;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.style.display = "block";
  }
});