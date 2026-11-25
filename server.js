import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors()); // más adelante: limitarlo a tu dominio
app.use(express.json());

const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL;

const SYSTEM_PROMPT = `Eres un asistente de orientación mecánica para conductores sin conocimientos técnicos.
Responde en español sencillo y paso a paso.
Empieza con el nivel de gravedad: LEVE, MEDIO o GRAVE.
Si es GRAVE, di claramente que no debe seguir manejando.
Aclara que es una orientación y no sustituye la revisión de un mecánico.
No inventes enlaces. Al final escribe una sola línea con este formato:
VIDEO: palabras para buscar en YouTube`;

app.post("/api", async (req, res) => {
  const { mensajes } = req.body;

  if (!Array.isArray(mensajes) || mensajes.length === 0) {
    return res.status(400).json({ respuesta: "Escribe tu pregunta para poder ayudarte." });
  }
  if (!API_KEY || !MODEL) {
    console.error("Falta OPENAI_API_KEY u OPENAI_MODEL en el archivo .env");
    return res.status(500).json({ respuesta: "El diagnóstico no está disponible por ahora." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...mensajes.slice(-10)]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error OpenAI:", response.status, data.error?.message);
      return res.status(502).json({
        respuesta: "No pude generar el diagnóstico en este momento. Intenta de nuevo en unos minutos."
      });
    }

    let texto = data.choices[0].message.content;
    texto = texto.replace(/VIDEO:\s*(.+)$/m, (_, busqueda) =>
      `Video de apoyo: https://www.youtube.com/results?search_query=${encodeURIComponent(busqueda.trim())}`
    );

    res.json({ respuesta: texto });
  } catch (error) {
    console.error("Error del servidor:", error.message);
    res.status(500).json({ respuesta: "Hubo un problema con el servidor. Intenta de nuevo." });
  } finally {
    clearTimeout(timeout);
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
