// tracker.js – log meals and compare today's total with the daily goal.

// Each entry: { id, name, calories, date }
let mealLog = loadData(KEYS.log, []);

const trackerForm = document.getElementById("tracker-form");
const logNameInput = document.getElementById("log-name");
const logCaloriesInput = document.getElementById("log-calories");
const trackerStatus = document.getElementById("tracker-status");
const trackerSummary = document.getElementById("tracker-summary");
const progressBar = document.getElementById("progress-bar");
const logList = document.getElementById("log-list");

function addLogEntry(name, calories) {
  mealLog.push({ id: makeId(), name: name, calories: calories, date: todayString() });
  saveData(KEYS.log, mealLog);
  renderTracker();
}

function renderTracker() {
  const goal = Number(loadData(KEYS.goal, 2000));
  const todaysEntries = mealLog.filter(entry => entry.date === todayString());
  const total = todaysEntries.reduce((sum, entry) => sum + entry.calories, 0);

  trackerSummary.textContent = "~" + total + " of ~" + goal + " kcal (approximate). Goal is set in the Planner.";

  const percent = Math.min(100, Math.round((total / goal) * 100));
  progressBar.style.width = percent + "%";
  progressBar.classList.toggle("over", total > goal);   // turns red when over goal

  logList.innerHTML = "";
  if (todaysEntries.length === 0) {
    logList.appendChild(createEl("li", "empty", "Nothing logged today."));
    return;
  }
  todaysEntries.forEach(function (entry) {
    const row = createEl("li");
    row.appendChild(createEl("span", "", entry.name + " – ~" + entry.calories + " kcal"));
    const deleteButton = createEl("button", "icon-btn", "✕");
    deleteButton.setAttribute("aria-label", "Delete " + entry.name);
    deleteButton.addEventListener("click", function () {
      mealLog = mealLog.filter(e => e.id !== entry.id);
      saveData(KEYS.log, mealLog);
      renderTracker();
    });
    row.appendChild(deleteButton);
    logList.appendChild(row);
  });
}

trackerForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = logNameInput.value.trim();
  const calories = Number(logCaloriesInput.value);

  if (!name) { showStatus(trackerStatus, "Please enter a meal name.", "error"); return; }
  if (name.length > 60) { showStatus(trackerStatus, "Meal name is too long (max 60 characters).", "error"); return; }
  if (!Number.isInteger(calories) || calories < 1 || calories > 5000) {
    showStatus(trackerStatus, "Enter calories as a whole number between 1 and 5000.", "error");
    return;
  }
  showStatus(trackerStatus, "");
  addLogEntry(name, calories);
  logNameInput.value = "";
  logCaloriesInput.value = "";
});