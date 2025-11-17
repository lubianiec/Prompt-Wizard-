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

      if (!HF_TOKEN) throw new Error("Brak tokena HF – coś nie tak z Vercel");

      const res = await fetch("https://api.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct", {
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
      });

      if (!res.ok) throw new Error(`Błąd HF: ${res.status}`);

      const data = await res.json();
      const text = Array.isArray(data) ? data[0].generated_text : data.generated_text || "Ups...";

      setResponse(text.trim());
    } catch (err: any) {
      setResponse(`Błąd: ${err.message}`);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-4">
            <Sparkles className="w-14 h-14 text-purple-600" />
            Prompt Wizard
            <Sparkles className="w-14 h-14 text-purple-600" />
          </h1>
          <p className="text-2xl text-gray-700">Testuj prompty ZA DARMO na Qwen 72B!</p>
          <p className="text-lg text-green-600 font-bold mt-4">100% darmowe • Bez żadnego klucza • Hugging Face</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-10 mb-10">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Wpisz swój prompt... np. Napisz bajkę o kosmicie-programiście 👽"
            className="w-full h-64 p-6 text-lg border-2 border-purple-200 rounded-2xl focus:border-purple-500 focus:outline-none resize-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-6 rounded-2xl text-2xl hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-4"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-10 h-10" />
                Czaruję...
              </>
            ) : (
              <>
                <Sparkles className="w-10 h-10" />
                Wyślij!
              </>
            )}
          </button>
        </form>

        {response && (
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Odpowiedź AI ✨</h2>
              <button onClick={copyToClipboard} className="flex items-center gap-3 px-6 py-3 bg-purple-100 hover:bg-purple-200 rounded-xl transition font-medium">
                <Copy className="w-6 h-6" />
                {copied ? "Skopiowane!" : "Kopiuj"}
              </button>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 text-lg leading-relaxed whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
