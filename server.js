import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api", async (req, res) => {

  const { mensajes } = req.body;

  try {

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: mensajes
      })
    });

    const data = await response.json();

    res.json({
      respuesta: data.choices[0].message.content
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      respuesta: "Error en la IA"
    });
  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor funcionando");
});