// api.js – the ONLY place the frontend talks to our backend.
// Note: it calls our own /api/chat, never Gemini directly, so no API key is needed here.

const API_URL = "/api/chat";
const CLIENT_TIMEOUT_MS = 30000; // give up after 30 seconds

async function callAI(payload) {
  const controller = new AbortController();               // lets us cancel the request
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    let data = null;
    try { data = await response.json(); } catch (e) { /* body was not JSON */ }

    if (!response.ok) {
      // Server sends a friendly message in data.error
      throw new Error((data && data.error) || "The AI service had a problem. Please try again.");
    }
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The request took too long. Please try again.");   // timeout
    }
    if (error instanceof TypeError) {
      throw new Error("Network problem. Check your internet connection and try again."); // offline
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}