// openAiService.js

import { systemMessage, buildUserMessage } from "./promptFile";

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export const getPlaylistFromOpenAI = async (prompt) => {
  console.log(">> [OpenAI] getPlaylistFromOpenAI called with prompt:", prompt);

  const messages = [
    {
      role: "system",
      content: systemMessage,
    },
    {
      role: "user",
      content: buildUserMessage(prompt),
    },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o", // or your preferred model
      messages,
      max_tokens: 800,
    }),
  });

  console.log(">> [OpenAI] Response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(">> [OpenAI] Response error text:", errorText);
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const data = await response.json();
  let rawText = data.choices?.[0]?.message?.content || "";

  console.log(">> [OpenAI] Raw text from API:", rawText);

  // הסרת סימני עיטוף (backticks) במידה וקיימים
  rawText = rawText.replace(/```json|```/g, "").trim();
  console.log(">> [OpenAI] Cleaned text (no backticks):", rawText);

  try {
    const jsonData = JSON.parse(rawText);
    if (!jsonData.songs) {
      console.warn(">> [OpenAI] No 'songs' field in returned JSON:", jsonData);
      return [];
    }

    console.log(">> [OpenAI] Parsed songs array:", jsonData.songs);
    return jsonData.songs;
  } catch (err) {
    console.error(">> [OpenAI] Failed to parse JSON:", err, "Raw:", rawText);
    throw new Error("Invalid JSON format from OpenAI.");
  }
};
