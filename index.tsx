import React, { useState } from "react";
import { Copy, Sparkles, Loader2 } from "lucide-react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse("");
    setCopied(false);

    try {
      const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

      if (!HF_TOKEN) {
        throw new Error("Brak klucza Hugging Face – sprawdź zmienne środowiskowe na Vercelu!");
      }

      const res = await fetch(
        "https://api.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 2048,
              temperature: 0.7,
              top_p: 0.9,
              return_full_text: false,
            },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Błąd HF: ${res.status} – ${err}`);
      }

      const data = await res.json();
      let text = "";
      if (Array.isArray(data) && data[0]?.generated_text) {
        text = data[0].generated_text;
      } else if (data.generated_text) {
        text = data.generated_text;
      } else {
        text = JSON.stringify(data);
      }

      setResponse(text.trim());
    } catch (err: any) {
      setResponse(`😱 Błąd: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Nagłówek */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
              <Sparkles className="w-12 h-12 text-purple-600" />
              Prompt Wizard
              <Sparkles className="w-12 h-12 text-purple-600" />
            </h1>
            <p className="text-xl text-gray-600">
              Testuj prompty za darmo na mocnym modelu Qwen 72B!
            </p>
            <p className="text-sm text-green-600 font-medium mt-4">
              ✅ Działa w 100% na darmowym Hugging Face – bez klucza od Ciebie!
            </p>
          </div>

          {/* Formularz */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Wpisz tutaj swój prompt... np. Napisz śmieszną historię o kotach-programistach 😺"
                className="w-full h-48 px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-5 px-8 rounded-xl text-xl hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-8 h-8" />
                    Czaruję...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-8 h-8" />
                    Wyślij prompt!
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Odpowiedź */}
          {response && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Odpowiedź AI:</h2>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  <Copy className="w-5 h-5" />
                  {copied ? "Skopiowane!" : "Kopiuj"}
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 whitespace-pre-wrap text-lg leading-relaxed">
                {response}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
