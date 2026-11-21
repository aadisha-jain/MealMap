// pantry.js – "What I already have at home". Stored in localStorage as a list of names.

const MAX_PANTRY_ITEMS = 30;
const MAX_PANTRY_NAME_LENGTH = 40;

let pantryItems = loadData(KEYS.pantry, []);   // e.g. ["Rice", "Onion", "Besan"]

const pantryForm = document.getElementById("pantry-form");
const pantryNameInput = document.getElementById("pantry-name");
const pantryStatus = document.getElementById("pantry-status");
const pantryCount = document.getElementById("pantry-count");
const pantryList = document.getElementById("pantry-list");
const pantryHint = document.getElementById("pantry-hint");   // small note in the Planner tab

// Lowercase + trim so "Onion " and "onion" count as the same thing
function normalizeName(name) {
  return String(name).trim().toLowerCase();
}

// A copy of the pantry names (sent to the AI)
function getPantryNames() {
  return pantryItems.slice();
}

// Does the user already have this ingredient?
// Used by BOTH the grocery list (to leave it out) and the planner (to show "uses pantry").
// Match rule: same name, or one name contains the other ("onions" matches "onion").
// We ignore names shorter than 3 letters when using "contains", to avoid silly matches.
function pantryHas(ingredientName) {
  const ingredient = normalizeName(ingredientName);
  return pantryItems.some(function (item) {
    const pantryName = normalizeName(item);
    if (pantryName === ingredient) return true;
    if (pantryName.length < 3 || ingredient.length < 3) return false;
    return ingredient.includes(pantryName) || pantryName.includes(ingredient);
  });
}

// Called after every add/remove: save, redraw, and refresh plan + grocery list
function pantryChanged() {
  saveData(KEYS.pantry, pantryItems);
  renderPantry();
  if (currentPlan) {                          // currentPlan lives in planner.js
    renderPlan();                             // refresh the "uses from your pantry" labels
    syncGroceryFromPlan(currentPlan, true);   // true = keep items already ticked as bought
  }
}

function renderPantry() {
  pantryCount.textContent = pantryItems.length + " of " + MAX_PANTRY_ITEMS + " items";
  pantryHint.textContent = pantryItems.length
    ? "🏠 " + pantryItems.length + " pantry item(s) will be used when planning."
    : "Tip: add what you have at home in the Pantry tab to save money.";

  pantryList.innerHTML = "";
  if (pantryItems.length === 0) {
    pantryList.appendChild(createEl("li", "empty", "Your pantry is empty."));
    return;
  }
  pantryItems.forEach(function (item) {
    const row = createEl("li");
    row.appendChild(createEl("span", "", item));
    const removeButton = createEl("button", "icon-btn", "✕");
    removeButton.setAttribute("aria-label", "Remove " + item);
    removeButton.addEventListener("click", function () {
      pantryItems = pantryItems.filter(p => p !== item);
      pantryChanged();
    });
    row.appendChild(removeButton);
    pantryList.appendChild(row);
  });
}

pantryForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = pantryNameInput.value.replace(/\s+/g, " ").trim();

  if (!name) { showStatus(pantryStatus, "Please type an item name.", "error"); return; }
  if (name.length > MAX_PANTRY_NAME_LENGTH) {
    showStatus(pantryStatus, "Item name is too long (max " + MAX_PANTRY_NAME_LENGTH + " characters).", "error"); return;
  }
  if (pantryItems.length >= MAX_PANTRY_ITEMS) {
    showStatus(pantryStatus, "Your pantry is full (max " + MAX_PANTRY_ITEMS + " items). Remove one first.", "error"); return;
  }
  if (pantryItems.some(p => normalizeName(p) === normalizeName(name))) {
    showStatus(pantryStatus, "“" + name + "” is already in your pantry.", "error"); return;
  }

  showStatus(pantryStatus, "");
  pantryItems.push(name);
  pantryNameInput.value = "";
  pantryChanged();
});