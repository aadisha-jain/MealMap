// grocery.js – grocery checklist: add, tick, delete, and auto-fill from the meal plan.

const CATEGORIES = ["Vegetables", "Fruits", "Grains", "Dairy & Eggs", "Protein", "Pantry", "Other"];

// Each item looks like: { id, name, category, bought, source }
// source: "plan" (from meal plan), "manual" (typed by user) or "chat" (added by chatbot)
let groceryItems = loadData(KEYS.grocery, []);

const groceryForm = document.getElementById("grocery-form");
const groceryNameInput = document.getElementById("grocery-name");
const groceryCategorySelect = document.getElementById("grocery-category");
const groceryStatus = document.getElementById("grocery-status");
const groceryListBox = document.getElementById("grocery-list");
const groceryCount = document.getElementById("grocery-count");

// Fill the category dropdown
CATEGORIES.forEach(function (category) {
  const option = createEl("option", "", category);
  option.value = category;
  groceryCategorySelect.appendChild(option);
});

// Add several items at once, skipping blanks and duplicates.
function addGroceryItems(items, source) {
  items.forEach(function (item) {
    const name = String(item.name || "").trim();
    if (!name || name.length > 60) return;
    const alreadyThere = groceryItems.some(i => i.name.toLowerCase() === name.toLowerCase());
    if (alreadyThere) return;
    const category = CATEGORIES.includes(item.category) ? item.category : "Other";
    groceryItems.push({ id: makeId(), name: name, category: category, bought: false, source: source });
  });
  saveData(KEYS.grocery, groceryItems);
  renderGrocery();
}

// Rebuild the plan-based items from a new meal plan (manual items are kept).
function syncGroceryFromPlan(plan) {
  groceryItems = groceryItems.filter(i => i.source !== "plan");
  const ingredients = [];
  plan.meals.forEach(meal => meal.ingredients.forEach(ing => ingredients.push(ing)));
  addGroceryItems(ingredients, "plan");
}

function renderGrocery() {
  groceryListBox.innerHTML = "";
  const boughtCount = groceryItems.filter(i => i.bought).length;
  groceryCount.textContent = groceryItems.length
    ? boughtCount + " of " + groceryItems.length + " bought"
    : "Your list is empty. Generate a meal plan or add items above.";

  CATEGORIES.forEach(function (category) {
    const itemsInCategory = groceryItems.filter(i => i.category === category);
    if (itemsInCategory.length === 0) return;

    groceryListBox.appendChild(createEl("h3", "", category));
    itemsInCategory.forEach(function (item) {
      const row = createEl("div", "grocery-row");

      const label = createEl("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = item.bought;
      checkbox.addEventListener("change", function () {
        item.bought = checkbox.checked;
        saveData(KEYS.grocery, groceryItems);
        renderGrocery();
      });
      label.appendChild(checkbox);
      label.appendChild(createEl("span", item.bought ? "bought" : "", item.name));

      const deleteButton = createEl("button", "icon-btn", "✕");
      deleteButton.setAttribute("aria-label", "Delete " + item.name);
      deleteButton.addEventListener("click", function () {
        groceryItems = groceryItems.filter(i => i.id !== item.id);
        saveData(KEYS.grocery, groceryItems);
        renderGrocery();
      });

      row.appendChild(label);
      row.appendChild(deleteButton);
      groceryListBox.appendChild(row);
    });
  });
}

// Manual add form
groceryForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = groceryNameInput.value.trim();
  if (!name) { showStatus(groceryStatus, "Please type an item name.", "error"); return; }
  if (name.length > 60) { showStatus(groceryStatus, "Item name is too long (max 60 characters).", "error"); return; }
  showStatus(groceryStatus, "");
  addGroceryItems([{ name: name, category: groceryCategorySelect.value }], "manual");
  groceryNameInput.value = "";
});

document.getElementById("clear-bought").addEventListener("click", function () {
  groceryItems = groceryItems.filter(i => !i.bought);
  saveData(KEYS.grocery, groceryItems);
  renderGrocery();
});