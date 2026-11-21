// planner.js – collects user input, asks the AI for a plan, and displays it.

let currentPlan = loadData(KEYS.plan, null);

const planForm = document.getElementById("plan-form");
const planButton = document.getElementById("plan-button");
const planStatus = document.getElementById("plan-status");
const planResult = document.getElementById("plan-result");

// Remember the last calorie goal and cuisine the user chose
document.getElementById("calorie-goal").value = loadData(KEYS.goal, 2000);
document.getElementById("cuisine").value = loadData(KEYS.cuisine, "Indian");   // NEW

// Save a new plan, show it, and rebuild the grocery list from it.
// Used by BOTH the planner form and the chatbot.
function applyNewPlan(plan) {
  currentPlan = plan;
  saveData(KEYS.plan, plan);
  renderPlan();
  syncGroceryFromPlan(plan);
}

planForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const workdayType = document.getElementById("workday-type").value;
  const diet = document.getElementById("diet").value;
  const cuisine = document.getElementById("cuisine").value;          // NEW
  const minutes = Number(document.getElementById("minutes-per-meal").value);
  const goal = Number(document.getElementById("calorie-goal").value);

  // Validate input before spending an API call
  if (!Number.isFinite(minutes) || minutes < 5 || minutes > 120) {
    showStatus(planStatus, "Time per meal must be between 5 and 120 minutes.", "error"); return;
  }
  if (!Number.isFinite(goal) || goal < 1000 || goal > 5000) {
    showStatus(planStatus, "Calorie goal must be between 1000 and 5000.", "error"); return;
  }

  // Loading state
  planButton.disabled = true;
  planButton.textContent = "Generating…";
  showStatus(planStatus, "⏳ Asking the AI to build your plan. This can take a few seconds.", "info");

  try {
    const data = await callAI({
      mode: "plan", workdayType: workdayType, diet: diet,
      cuisine: cuisine,                    // NEW
      pantry: getPantryNames(),            // NEW (from pantry.js)
      minutesPerMeal: minutes, calorieGoal: goal
    });
    saveData(KEYS.goal, goal);
    saveData(KEYS.cuisine, cuisine);       // NEW
    applyNewPlan(data.plan);
    renderTracker();                                  // goal may have changed
    showStatus(planStatus, "Plan ready! Your grocery list was updated too.", "success");
  } catch (error) {
    showStatus(planStatus, error.message, "error");
  } finally {
    planButton.disabled = false;
    planButton.textContent = "Generate plan";
  }
});

function renderPlan() {
  planResult.innerHTML = "";
  if (!currentPlan) {
    planResult.appendChild(createEl("p", "empty", "No plan yet. Fill in the form and press Generate."));
    return;
  }

  const total = currentPlan.meals.reduce((sum, meal) => sum + meal.calories, 0);
  planResult.appendChild(createEl("p", "plan-total", "Plan total: ~" + total + " kcal (approximate)"));

  currentPlan.meals.forEach(function (meal) {
    // NEW: which ingredients of this meal does the user already have?
    const fromPantry = meal.ingredients.filter(i => pantryHas(i.name)).map(i => i.name);

    const card = createEl("article", "card meal-card" + (fromPantry.length ? " uses-pantry" : ""));
    card.appendChild(createEl("span", "meal-type", meal.type));
    card.appendChild(createEl("h3", "", meal.name));
    card.appendChild(createEl("p", "meal-meta",
      "⏱ " + meal.prepMinutes + " min · ~" + meal.calories + " kcal (approx.)"));
    card.appendChild(createEl("p", "meal-ingredients",
      "Ingredients: " + meal.ingredients.map(i => i.name).join(", ")));

    if (fromPantry.length) {
      card.appendChild(createEl("p", "pantry-note", "🏠 Uses from your pantry: " + fromPantry.join(", ")));
    }

    const logButton = createEl("button", "btn small", "Log this meal");
    logButton.addEventListener("click", function () {
      addLogEntry(meal.name, meal.calories);
      showStatus(planStatus, "“" + meal.name + "” added to your tracker.", "success");
    });
    card.appendChild(logButton);
    planResult.appendChild(card);
  });

  if (currentPlan.tip) planResult.appendChild(createEl("p", "tip", "💡 " + currentPlan.tip));
}