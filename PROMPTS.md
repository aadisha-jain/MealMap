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
**Result:** four findings with source links. I opened the links and checked the numbers myself before using them in the README. [Add anything you changed or dropped.]

## 6. Prompt Improvement Example
**Before:** Gemini's suggestion was to rename each meal by its position, which would give wrong labels if the AI returned meals in a different order.
**After:** I asked Claude for a safer fix. The new `cleanPlan` accepts the plan only if it has exactly 4 meals in the order Breakfast, Lunch, Snack, Dinner, and otherwise keeps the user's current plan.
**Effect:** a bad AI answer can no longer break the page or mislabel meals. The trade-off is that a request such as "skip snack" leaves the plan unchanged.

## 7. Errors and How I Solved Them
- Wrong Vercel project linked: removed the `.vercel` folder and linked a new project with `vercel link --yes --project mealmap`.
- Missing API key and old model name: see section 3.
- Secrets safety: checked `git status` before pushing so `.env.local` was never uploaded.