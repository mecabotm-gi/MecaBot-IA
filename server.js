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

console.log(data);

if(data.error){
  return res.json({
    respuesta: "ERROR OPENAI: " + data.error.message
  });
}

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
