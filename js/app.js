// app.js – tab navigation and startup. Loaded last.

const tabButtons = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

function showTab(targetId) {
  tabButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.target === targetId));
  panels.forEach(panel => panel.classList.toggle("active", panel.id === targetId));
}

tabButtons.forEach(btn => btn.addEventListener("click", () => showTab(btn.dataset.target)));

// Draw everything that was saved in localStorage
renderPlan();
renderGrocery();
renderTracker();