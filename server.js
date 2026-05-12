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
