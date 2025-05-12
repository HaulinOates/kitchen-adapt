const express = require('express');
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
  const { original, target, baseTime, baseTemp, ingredients } = req.body;

  const scaleFactor = (target.volume / original.volume).toFixed(2);
  const scaledIngredients = ingredients.map(i => ({
    ...i,
    quantity: (i.quantity * scaleFactor).toFixed(2)
  }));

  const prompt = `
You are a professional chef and kitchen scientist. A user has a recipe designed for a ${original.material} ${original.shape} dish of size ${original.dimensions}, but they only have a ${target.material} ${target.shape} dish of size ${target.dimensions}. The original recipe takes ${baseTime} minutes at ${baseTemp}°F.

Please estimate:
1. A new cook time.
2. Whether the temperature should be adjusted.
3. Any ingredient-specific notes (e.g., baking powder, eggs, or liquids).
4. Tips based on material heat retention or browning.

Return the result as JSON in this format:
{
  "newTime": <minutes>,
  "newTemp": <temp>,
  "notes": [ "tip 1", "tip 2", ... ]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });

    const aiResponse = JSON.parse(response.choices[0].message.content);

    res.json({
      scaledIngredients,
      newTime: aiResponse.newTime,
      newTemp: aiResponse.newTemp,
      notes: aiResponse.notes
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("AI adjustment failed.");
  }
});

module.exports = router;
