// utils.js – small helpers used by every other file.

// Keys used in localStorage (one per kind of data)
const KEYS = {
  plan: "mealmap_plan",
  grocery: "mealmap_grocery",
  log: "mealmap_log",
  goal: "mealmap_goal",
  pantry: "mealmap_pantry",     // NEW: items the user already has
  cuisine: "mealmap_cuisine"    // NEW: last chosen cuisine
};

// Read JSON from localStorage. If anything goes wrong, return the fallback.
function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

// Save any value as JSON in localStorage.
function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Could not save to localStorage:", error);
  }
}

// Create an element with a class and text.
// We use textContent (not innerHTML) so AI text can never inject HTML/scripts.
function createEl(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

// Show (or hide, if message is empty) a status box. type: "info" | "error" | "success"
function showStatus(box, message, type) {
  box.textContent = message || "";
  box.className = "status" + (type && type !== "info" ? " " + type : "");
  box.hidden = !message;
}

// Unique id for list items
function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Today's date as YYYY-MM-DD in the user's local time
function todayString() {
  return new Date().toLocaleDateString("en-CA");
}