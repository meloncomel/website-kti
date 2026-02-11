import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper untuk konversi File ke Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Menghapus prefix "data:image/xxx;base64,"
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });
};

// 1. FAST AI: Chat Interaktif (Menggunakan Gemini Flash Lite)
export const chatWithMentorAi = async (message: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Sistem AI tidak tersedia.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', // Model cepat untuk chat
      contents: message,
      config: {
        systemInstruction: "Anda adalah mentor akademik virtual yang ramah, responsif, dan pintar. Jawablah pertanyaan siswa dengan ringkas namun jelas. Fokus pada motivasi dan panduan praktis penulisan KTI.",
      }
    });
    return response.text || "Maaf, saya tidak mengerti.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Terjadi gangguan koneksi.";
  }
};

// 2. DEEP THINKING & IMAGE ANALYSIS (Menggunakan Gemini 3 Pro)
export const consultWithAiAssistant = async (
  prompt: string, 
  imageBase64?: string, 
  imageMimeType?: string,
  useThinkingMode: boolean = false
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Sistem AI tidak tersedia.";

  try {
    const parts: any[] = [];
    
    // Jika ada gambar, tambahkan ke parts
    if (imageBase64 && imageMimeType) {
      parts.push({
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64
        }
      });
    }

    // Tambahkan teks prompt
    parts.push({ text: prompt });

    const config: any = {};
    
    // Konfigurasi Thinking Mode jika diaktifkan
    if (useThinkingMode) {
      config.thinkingConfig = { thinkingBudget: 32768 }; // Max budget untuk deep reasoning
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Model advanced untuk thinking dan gambar
      contents: { parts },
      config: config
    });

    return response.text || "Tidak ada respon yang dihasilkan.";
  } catch (error) {
    console.error("Consultation Error:", error);
    return "Gagal memproses permintaan Anda. Coba lagi nanti.";
  }
};

// 3. GENERATOR REFERENSI (Standard Flash)
export const generateReferences = async (topic: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "[]";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: `Berikan 3 referensi ilmiah (Buku/Jurnal) yang valid dan nyata terkait topik: "${topic}". 
      Format output HARUS array JSON murni tanpa markdown: 
      [{"title": "Judul", "author": "Penulis", "year": "Tahun", "type": "Jurnal/Buku", "url": "#"}]`,
    });
    
    let text = response.text || "[]";
    // Bersihkan markdown jika ada
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return text;
  } catch (error) {
    return "[]";
  }
};

// Legacy function support (updated to use Flash)
export const checkGrammarAndStyle = async (text: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Sistem AI tidak tersedia.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: `Periksa teks berikut untuk tata bahasa Indonesia (PUEBI), kejelasan, dan gaya penulisan akademik. Berikan saran perbaikan poin per poin:\n\n${text}`,
      config: {
        systemInstruction: "Anda adalah editor jurnal ilmiah. Fokus pada ejaan baku, struktur kalimat efektif, dan nada objektif ilmiah."
      }
    });
    return response.text || "Tidak ada saran.";
  } catch (error) {
    return "Gagal melakukan pengecekan.";
  }
};