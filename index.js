const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios"); 
const fs = require("fs"); 

const app = express();
const PORT = 3000;


app.use(bodyParser.json());

app.use("/static", express.static(path.join(__dirname, "static")));


const TRANSLATION_API_URL = "https://translation.googleapis.com/language/translate/v2";
const TRANSLATION_API_KEY = "";


let intents = { intents: [] }; 
try {
  const intentsData = fs.readFileSync("intents.json");
  intents = JSON.parse(intentsData);
} catch (error) {
  console.error("Error loading intents:", error);
}


const translateText = async (text, targetLanguage) => {
  try {
    const response = await axios.post(TRANSLATION_API_URL, {
      q: text,
      target: targetLanguage,
      key: TRANSLATION_API_KEY,
    });
    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Translation API error:", error);
    return text; 
  }
};


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

app.post("/get_response", async (req, res) => {
  const userMessage = req.body.message.toLowerCase();
  const targetLanguage = req.body.language || "en"; 


  let responseText = "I'm here to listen. Please tell me more."; 
  for (let intent of intents.intents) {
    if (intent.patterns.map(p => p.toLowerCase()).includes(userMessage)) {
      responseText = intent.responses[Math.floor(Math.random() * intent.responses.length)];
      break;
    }
  }

  const translatedResponse = await translateText(responseText, targetLanguage);

  
  await sleep(500); 

  res.json({ response: translatedResponse });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
