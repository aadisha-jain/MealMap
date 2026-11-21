// chat.js – the chatbot window. The AI's reply can also change the plan or grocery list.

const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");
const chatStatus = document.getElementById("chat-status");

const MAX_MESSAGE_LENGTH = 500;
let chatHistory = [];     // [{ role: "user" | "bot", text }] – sent to the AI for context
let chatBusy = false;     // stops double-sending while waiting

function addBubble(role, text) {
  const bubble = createEl("div", "bubble " + role, text);
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return bubble;
}

// Static greeting (interface text only – every real answer comes from the AI)
addBubble("bot", "Hi! Ask me to adjust your meals, add groceries, or estimate calories. 🥗");

chatForm.addEventListener("submit", function (event) {
  event.preventDefault();
  sendMessage(chatInput.value);
});

// Suggestion chips send their own text
document.querySelectorAll(".chip").forEach(function (chip) {
  chip.addEventListener("click", () => sendMessage(chip.textContent));
});

async function sendMessage(rawText) {
  const text = rawText.trim();

  // Input checks
  if (!text) { showStatus(chatStatus, "Please type a message first.", "error"); return; }
  if (text.length > MAX_MESSAGE_LENGTH) {
    showStatus(chatStatus, "Message is too long (" + text.length + "/" + MAX_MESSAGE_LENGTH + " characters). Please shorten it.", "error");
    return;
  }
  if (chatBusy) return;

  showStatus(chatStatus, "");
  addBubble("user", text);
  chatInput.value = "";
  chatBusy = true;
  chatSend.disabled = true;
  const typingBubble = addBubble("bot typing", "Thinking…");   // loading indicator

  try {
    const data = await callAI({
      mode: "chat",
      message: text,
      history: chatHistory.slice(-6),               // last 6 messages only
      plan: currentPlan,
      grocery: groceryItems.map(item => item.name),
      cuisine: loadData(KEYS.cuisine, "Indian"),    // NEW
      pantry: getPantryNames()                      // NEW
    });

    typingBubble.remove();
    chatHistory.push({ role: "user", text: text }, { role: "bot", text: data.reply });

    // NEW: the server says the AI's new plan was not valid, so show a warning-style bubble
    if (data.planFailed) {
      addBubble("bot error", "⚠️ " + data.reply);
      return;   // the finally block below still runs
    }

    addBubble("bot", data.reply);

    if (data.updatedPlan) {
      applyNewPlan(data.updatedPlan);
      addBubble("system", "✅ Your meal plan and grocery list were updated.");
    }
    if (data.addGroceryItems && data.addGroceryItems.length > 0) {
      addGroceryItems(data.addGroceryItems, "chat");
      addBubble("system", "🛒 Added " + data.addGroceryItems.length + " item(s) to your grocery list.");
    }
  } catch (error) {
    typingBubble.remove();
    addBubble("bot error", "⚠️ " + error.message);
  } finally {
    chatBusy = false;
    chatSend.disabled = false;
    chatInput.focus();
  }
}