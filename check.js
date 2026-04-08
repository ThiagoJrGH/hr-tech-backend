// check.js
const apiKey = "AIzaSyAPey0pJhypT07dC5Wm2xwrmZHvX9KTZ4M";

async function verModelos() {
  console.log("🔍 Preguntándole a Google...");
  const respuesta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const datos = await respuesta.json();
  
  if (datos.models) {
    console.log("✅ ¡Éxito! Estos son los modelos que SÍ puedes usar:");
    const nombres = datos.models.map(m => m.name).filter(n => n.includes("gemini"));
    console.log(nombres);
  } else {
    console.log("❌ Error de Google:", datos);
  }
}

verModelos();