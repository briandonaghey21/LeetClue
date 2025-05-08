require("dotenv").config();
const express = require("express");
const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());

app.post("/api/generate-hint", async (req, res) => {
  if (!title || !description) {
    return res.status(400).json({ error: "Missing title or description." });
  }
  // todo make open ai api call and make env variable

  try {
   
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate hint." });
  }
});

app.listen(port, () => {
  console.log( ` API running at http://localhost:${port}`);
});

