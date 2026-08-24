/**
 * llm.js — LLM local en el navegador vía transformers.js (WEB-016)
 *
 * Modelo: Xenova/Phi-3.5-mini-instruct-q4_k_m (~2.4GB quantizado)
 * Se descarga una vez desde HuggingFace y se cachea en IndexedDB.
 * Si falla (sin red, modelo no disponible), usa el pipeline ML actual.
 *
 * No envía datos a ningún servidor — inferencia 100% local.
 */
import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3";

// No descargar modelos remotos, solo locales/cacheados
env.allowLocalModels = false;

let generator = null;
let modelReady = false;
let modelLoading = false;

/**
 * Carga el modelo LLM. Devuelve true si OK, false si fallback.
 * Se cachea: solo descarga la primera vez.
 */
export async function loadLLM() {
  if (modelReady) return true;
  if (modelLoading) return false;

  modelLoading = true;
  const statusEl = document.getElementById("llm-status");

  try {
    if (statusEl) statusEl.textContent = "Descargando modelo (~200MB, primera vez)...";

    generator = await pipeline("text-generation", "Xenova/Phi-3.5-mini-instruct-q4_k_m", {
      dtype: "q4_k_m",
      device: "wasm",
      progress_callback: (p) => {
        if (p.status === "downloading" && statusEl) {
          const pct = p.progress ? `${Math.round(p.progress)}%` : "...";
          statusEl.textContent = `Descargando modelo: ${pct}`;
        }
      },
    });

    modelReady = true;
    modelLoading = false;
    if (statusEl) statusEl.textContent = "Modelo listo";
    return true;
  } catch (e) {
    console.warn("LLM load failed, using ML fallback:", e);
    modelLoading = false;
    if (statusEl) statusEl.textContent = "Modelo no disponible — usando pipeline ML";
    return false;
  }
}

/**
 * Redacta un resumen del resultado de riesgo usando el LLM local.
 * @param {object} resultado - { clase, riesgo, provincia, fecha, edad, ... }
 * @returns {string} Texto redactado o null si fallback.
 */
export async function redactar(resultado) {
  if (!modelReady || !generator) return null;

  try {
    const prompt = `Eres un asistente de salud pública. Resume el siguiente resultado de riesgo climático en 2-3 frases claras y útiles para el usuario. No inventes datos. Sé conciso.

Riesgo: ${resultado.clase} (${resultado.riesgo}%)
Provincia: ${resultado.provincia || "no especificada"}
Fecha: ${resultado.fecha || "hoy"}
Edad: ${resultado.edad || "no especificada"}

Resumen:`;

    const output = await generator(prompt, {
      max_new_tokens: 120,
      temperature: 0.3,
      do_sample: false,
    });

    return output[0].generated_text.replace(prompt, "").trim();
  } catch (e) {
    console.warn("LLM redaction failed:", e);
    return null;
  }
}

/**
 * Estado del modelo para UI.
 */
export function getStatus() {
  if (modelReady) return "ready";
  if (modelLoading) return "loading";
  return "idle";
}
