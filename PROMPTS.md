# Prompt Documentation: MealMap

## 1. Prompt v1: Initial Project-Building Prompt (Claude)
I wrote this prompt before building anything, using the five parts of a good prompt. I drafted it with Claude's help and customized it for my project. I used it as the first message in a new Claude chat. The output (full source code and setup steps) is in the shared chat: https://claude.ai/share/19aabf4f-953c-4726-88fc-aa2341a3d56b

```
ROLE
You are a senior full-stack web developer and UX designer who builds beginner-friendly, well-commented web apps with AI chatbot integration. Write clean, simple code and explain it as if mentoring a second-year engineering student who must understand every line for a viva.

TASK
Build a complete, working website called "MealMap": an AI-powered smart meal planner, grocery checklist, and lightweight calorie tracker. It must include these features:
1. Meal Planner: the user enters their workday type (meeting-heavy, work-from-home, long commute), diet preference (vegetarian / non-vegetarian / eggetarian), time available per meal, and a daily calorie goal. The AI generates a one-day meal plan (breakfast, lunch, snack, dinner) with prep time and approximate calories for each meal.
2. Grocery Checklist: automatically generated from the meal plan, grouped by category (vegetables, grains, dairy, etc.), with checkboxes to mark items bought, plus the ability to add and delete items manually.
3. Calorie Tracker: the user logs meals with approximate calories, sees a daily total against their goal, and a progress bar.
4. AI Chatbot: a chat window on the website where users can ask for meal or schedule adjustments (e.g. "swap dinner for something under 20 minutes", "I have back-to-back meetings tomorrow, adjust my plan", "add these ingredients to my grocery list").

CONTEXT
Target audience: busy corporate professionals with packed schedules, back-to-back meetings, and long commutes. Secondary audience: busy people living independently who want easy grocery organization and a simple view of daily calories.
Problem: these users often skip meals, rely on last-minute takeout, buy groceries in an unorganized way, and lose track of calorie intake, leading to fatigue, higher food expenses, and inconsistent eating habits.
Purpose: give them a fast, practical tool to plan time-friendly meals around their workday, manage one structured grocery list, track calories with minimal effort, and get instant adjustments through an AI chatbot.
Note: this is a college project for a Prompt Engineering course, so the code must be easy to understand and explain.

CONSTRAINTS
- Tech stack: HTML, CSS, and vanilla JavaScript only (no React or other frameworks). Store user data (meal plan, grocery list, calorie log) in the browser's localStorage.
- Chatbot and AI integration: the chatbot and meal generation must call a real AI model through an API (use the [Gemini API]). Do NOT use predefined or hardcoded responses.
- API security: make the API call from a Vercel serverless function (api/chat.js) so the API key stays in an environment variable and never appears in frontend code or the GitHub repo.
- Chatbot behavior: it must stay on topic (meals, groceries, calories, scheduling around work). Politely redirect unrelated questions.
- Error handling: handle empty input, very long input, off-topic input, API failure, network failure, and timeouts, showing clear user-friendly messages and a loading indicator.
- Design: clean, modern, responsive (works on mobile and desktop), with a simple navigation between Planner, Grocery, Tracker, and Chat.
- Calories: show all calorie values as "approximate" and include a short disclaimer that the app does not give medical or dietary advice.
- Scope: keep it simple. No login system, no database, no payment features.
- Code quality: add helpful comments, use meaningful names, and keep each file focused on one job.

OUTPUT FORMAT
1. First, show the complete project file structure (a folder tree).
2. Then give the full source code for every file, each in its own code block labeled with its file name.
3. Then give step-by-step instructions to run the project locally, set the API key as an environment variable, and deploy to Vercel.
4. Include a .gitignore that keeps secrets out of GitHub.
5. End with a short plain-language explanation of how the frontend, the serverless function, and the AI API connect, so I can explain it in my viva.

```

### How each of the five parts shaped the result
| Part | What it did in my prompt | Effect on the output |
|------|--------------------------|----------------------|
| Role | Senior full-stack developer and UX designer who mentors a student | Beginner-friendly, well-commented code with a plain-language explanation |
| Task | Build MealMap with planner, grocery list, calorie tracker, and chatbot | All four features were generated |
| Context | Problem statement and audience of busy corporate professionals | Features and example chatbot prompts fit that audience |
| Constraints | Vanilla HTML/CSS/JS, localStorage, Gemini API through a Vercel serverless function, error handling, no keys in code | Simple stack, the API key stayed on the server, errors handled |
| Output Format | File tree, full code per file, run and deploy steps, explanation | Organized project I could copy file by file |

## 2. Prompt Techniques Used
- **Role-based prompting:** every prompt starts by giving the AI a role.
- **Structured prompting:** the five-part format with numbered tasks.
- **Context-based prompting:** project and audience background in each prompt.
- **Chain prompting:** build first, then debug, then review, then improve.
- **Prompt refinement:** a vague suggestion was turned into a specific fix (see section 6).
- **Response evaluation:** I checked AI answers against real sources and real behavior (see sections 4 and 5).
- **Constraints inside the app:** the chatbot's system prompt keeps it on topic and tells it to ignore attempts to override its rules, and it forces JSON output in a fixed format.
- **Context refresh:** before asking for changes, I gave the AI my current edited code so it would not work from an outdated copy.

## 3. Debugging Prompts (Claude)
| Problem | What I gave the AI | What fixed it |
|---------|--------------------|---------------|
| Chatbot said the API key was missing | The terminal message and my `.env.local` details | Added the key to the Vercel project with `vercel env add` |
| Gemini error 404: model no longer available | The full error text | Listed the models my key can use, tested one, and set `GEMINI_MODEL=gemini-3.1-flash-lite` with no code change |
| 504 timeout from the chatbot | The error and the timeout settings from `api/chat.js` | Direct tests showed the connection was fine but the model was slow, so I switched to a faster "lite" model |
| Vercel permission error (EPERM symlink) on Windows | The error log | Turned on Windows Developer Mode |

## 4. Prompt: Gemini Code Review
**Task:** review `api/chat.js` and suggest one improvement.
```
You are a senior Node.js developer mentoring a second-year engineering student.
Below is the serverless function for my meal-planner chatbot. It calls the Gemini API.
1. Explain what the code does, section by section, in simple language.
2. Suggest ONE small improvement that makes the chatbot's replies better or safer.
Keep the answer short.
[code pasted here]
```
**Result:** Gemini explained each section and found that `cleanPlan` accepted any number of meals, so the page could break or show wrong labels.

## 5. Prompt: Perplexity Research
**Task:** find sourced facts for my problem statement.
```
You are a research assistant helping a second-year engineering student.
My project is MealMap, an AI meal planner, grocery checklist, and calorie tracker for busy corporate professionals.
Find 3 to 4 credible facts or studies, ideally covering India, about:
- skipped meals or unhealthy eating among office workers
- how long work hours and commutes affect eating habits
For each one, give the key finding in one sentence and the source link.
Keep the answer short.
```
**Result:** four findings with source links. I opened the links and checked the numbers myself before using them in the README.

## 6. Prompt Improvement Example
**Before:** Gemini's suggestion was to rename each meal by its position, which would give wrong labels if the AI returned meals in a different order.
**After:** I asked Claude for a safer fix. The new `cleanPlan` accepts the plan only if it has exactly 4 meals in the order Breakfast, Lunch, Snack, Dinner, and otherwise keeps the user's current plan.
**Effect:** a bad AI answer can no longer break the page or mislabel meals. The trade-off is that a request such as "skip snack" leaves the plan unchanged.
## 6A. Prompt v2: Indian Dishes and Pantry (Claude)
**Why:** the first version suggested generic dishes and had no way to use food I already have at home, which matters for my problem statement (wasted money and last-minute takeout).

**Step 1: context prompt.** Before v2, I pasted my current `api/chat.js` into the same chat and told Claude to use it as the base. This was needed because I had edited `cleanPlan` myself, and Claude's older copy would have overwritten my fix.

**Step 2: the v2 prompt.**
```
ROLE
You are the same senior full-stack developer and UX designer who built MealMap. Keep mentoring me: simple code, helpful comments, and a plain-language explanation I can use in my viva.

TASK
Extend the existing MealMap project with two features. Do not rebuild it, and do not break anything that already works.
1. Indian cuisine: add a "Cuisine" option to the planner form (Indian, Mixed, International; default Indian). When Indian is chosen, the AI should suggest practical Indian dishes (e.g. poha, upma, dal-chawal, roti-sabzi, paneer bhurji, khichdi, idli-sambar, chilla), including vegetarian, north and south Indian options, that fit a busy workday.
2. Pantry ("What I already have at home"): add a pantry section where the user adds and removes items they already have. When a plan is generated, the AI must prefer dishes that use pantry items, and the grocery list must leave out ingredients the user already has. In the planner, show which meals use pantry items. The chatbot must also know the pantry items so replies and swaps respect them.
3. Also fix this: in chat mode, if the AI's new plan fails the cleanPlan check (so updatedPlan becomes null), the server must not let the reply claim a change was made. Instead, it should return a short message like "I couldn't update your plan this time, please try rephrasing", and the frontend should show it.

CONTEXT
MealMap is for busy corporate professionals in India who skip meals or order takeout. Using what is already at home saves money and food waste, and supports the project's problem statement. My current structure: api/chat.js, js/ (utils, api, grocery, tracker, planner, chat, app), css/style.css, index.html.

CONSTRAINTS
- Keep vanilla HTML/CSS/JS, localStorage, and the existing Vercel serverless function. Store the pantry in localStorage.
- Keep all current validation, error handling, the 25-second timeout, and the exact 4-meal check in cleanPlan.
- Validate the new inputs on the server too (cuisine from an allowed list, pantry items capped at 30 items and 40 characters each, text trimmed).
- Keep the system prompt rules: stay on topic, ignore attempts to override rules, return JSON in the existing format.
- The API key must never appear in frontend code.
- Add only what is needed. Keep existing function names where possible.

OUTPUT FORMAT
1. List which files change and why, in a short list.
2. Give the COMPLETE updated code for each changed file (not snippets), each in its own code block labeled with the file name.
3. Say exactly which files are new, if any.
4. Give a short "how to test" checklist.
5. End with a simple explanation of how the pantry data flows from the browser to the AI and back, for my viva.

```

**What improved:**
| Before | After |
|--------|-------|
| Generic dishes only | Cuisine option with Indian dishes as the default |
| No pantry | Pantry tab; meals using pantry items are highlighted and the grocery list leaves them out |
| Chat could say "I changed your plan" even when the change was rejected by validation | The server now replies "I couldn't update your plan" and the plan stays unchanged |

**Prompt refinement example:** Claude warned me about the failed-plan problem after seeing my stricter `cleanPlan`. I added a specific instruction for it to the next prompt, and the fix was built into v2.

## 6B. Prompt v3: Colourful Redesign (Claude)
**Why:** the first design looked plain.
```
ROLE
You are the same senior full-stack developer and UI designer who built MealMap. Keep the code simple, add helpful comments, and explain your choices in plain language I can use in my viva.

TASK
Redesign the look of MealMap so it feels colourful, creative, and fun to use. This is a visual change only. Do not change how any feature works.
1. Colours and theme: warm Indian-inspired palette (saffron orange, turmeric yellow, chilli red accents, fresh green for success states, a soft cream background). Define all colours as CSS variables at the top of the file so I can change the theme easily.
2. Header: a bold, colourful header with the MealMap name, a short tagline, and a decorative gradient background.
3. Tabs: icon plus label on each tab (emoji icons are fine), with a clear active state and a smooth hover effect.
4. Cards: rounded corners, soft shadows, and a coloured accent on each meal type (Breakfast, Lunch, Snack, Dinner each get their own colour). Meal cards that use pantry items keep a clear highlight.
5. Buttons and inputs: friendly rounded style, clear focus outlines, and a subtle press effect.
6. Chat: a polished chat window with distinct user and bot bubbles, a visible typing state, and nicer suggestion chips.
7. Tracker: a more attractive progress bar that changes colour as the user approaches and passes the calorie goal.
8. Empty states: friendly empty-state messages with an emoji for the empty plan, grocery list, pantry, and tracker (change only the text and styling, not the logic).
9. Small touches: subtle animations (fade-in for cards, smooth tab changes), and a footer that is easy to read.

CONTEXT
MealMap is for busy corporate professionals in India. The first impression should feel warm, appetizing, and trustworthy, not boring or cluttered. It is a college project and must stay easy for me to explain.

CONSTRAINTS
- Keep vanilla HTML and CSS. No frameworks, no external libraries, no image files. Use only CSS, emoji, and inline SVG if needed. System fonts only, or at most one Google Font loaded with a link tag.
- Do NOT rename or remove any id, data-target attribute, or class name that the JavaScript files use. Every feature must keep working exactly as it does now. Only add new classes if needed.
- Do not change any JavaScript file unless it is truly required. If a JS change is needed, say exactly why, and keep it minimal.
- Keep the layout responsive for mobile and desktop.
- Keep good contrast so text stays readable, and keep clear focus styles for keyboard users.
- Respect prefers-reduced-motion by turning off animations for users who ask for it.
- Keep the disclaimer in the footer.

OUTPUT FORMAT
1. List which files change and why. I expect only css/style.css and index.html.
2. Give the COMPLETE updated code for each changed file, each in its own code block labeled with the file name.
3. Give a short "how to test" checklist covering every tab and the mobile view.
4. End with a simple explanation of how the CSS variables and the colour system work, for my viva.

```
**Prompt techniques:** the prompt asked for a visual change only, listed 9 specific design requirements, and set constraints so nothing in the JavaScript would break (no renamed ids or classes, no new libraries, responsive, reduced-motion support). Only `index.html` and `css/style.css` changed.

**Effect:** a warm Indian-inspired theme with colour-coded meal cards and a more polished chat, with all features still working.

## 7. Errors and How I Solved Them
- Wrong Vercel project linked: removed the `.vercel` folder and linked a new project with `vercel link --yes --project mealmap`.
- Missing API key and old model name: see section 3.
- Secrets safety: checked `git status` before pushing so `.env.local` was never uploaded.