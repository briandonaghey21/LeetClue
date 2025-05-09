require("dotenv").config();
const express = require("express");
const { OpenAI } = require("openai");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({
  origin: "chrome-extension://gfljffbelkffaobelfagfmkhgfacpajp",
  methods: ["POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.post("/api/generate-hint", async (req, res) => {
  const { title, description, cache = [] } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Missing title or description." });
  }

  const prompt = `Give a small one-sentence direct hint for the following LeetCode problem that is different from the following list:
    Previous hints: ${cache.join(".")}
    Problem Title: ${title}
    Problem Description: ${description}
    Hint:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.9
    });

    const hint = completion.choices[0].message.content.trim();
    res.json({ hint });
  } catch (err) {
    console.error("OpenAI Error:", err);
    res.status(500).json({ error: "Failed to generate hint." });
  }
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
