
import { GoogleGenAI } from "@google/genai";

// Declare lucide as a global variable since it's used for icon generation in the vanilla JS parts
declare const lucide: any;

// --- CONFIG & STATE ---
const state = {
  currentUser: null,
  activeTab: 'dashboard',
  isSidebarOpen: true,
  submissions: [
    { id: 's1', title: 'Analisis Kualitas Air Sungai Ciliwung', studentName: 'Andi Saputra', date: '2023-10-15', status: 'Perlu Revisi', chapter: 'BAB 1', feedback: 'Perbaiki latar belakang masalah.' },
    { id: 's2', title: 'Implementasi IoT pada Pertanian Cabai', studentName: 'Budi Utomo', date: '2023-10-16', status: 'ACC / Disetujui', chapter: 'BAB 1' },
  ],
  messages: [
    { sender: 'AI', text: 'Halo! Saya asisten KTI Anda. Ada yang bisa dibantu?', isAi: true, time: new Date() }
  ],
  references: [
    { title: 'Metode Penelitian Kuantitatif', author: 'Sugiyono', year: '2019', type: 'Buku' }
  ],
  aiLoading: false
};

// --- AI SERVICE ---
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

async function callGemini(modelName, prompt, systemInstruction = "", thinking = false, image = null) {
  const ai = getAiClient();
  const config: any = { systemInstruction };
  if (thinking) config.thinkingConfig = { thinkingBudget: 15000 };

  const contents: any = image 
    ? { parts: [{ inlineData: { data: image.data, mimeType: image.mimeType } }, { text: prompt }] }
    : prompt;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: config
    });
    // The `.text` property returns the generated string output.
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Maaf, terjadi kesalahan pada koneksi AI.";
  }
}

// --- UTILS ---
const fileToBase64 = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve({ data: (reader.result as string).split(',')[1], mimeType: file.type });
});

// --- UI COMPONENTS ---
function render() {
  const root = document.getElementById('root');
  if (!state.currentUser) {
    root.innerHTML = renderLogin();
    attachLoginEvents();
  } else {
    root.innerHTML = `
      <div class="flex min-h-screen">
        ${renderSidebar()}
        <main class="flex-1 p-8 transition-all duration-300 ${state.isSidebarOpen ? 'ml-64' : 'ml-20'}">
          ${renderHeader()}
          <div id="content-area" class="animate-fade-in">
            ${renderTabContent()}
          </div>
        </main>
      </div>
    `;
    attachAppEvents();
    // Fix: Using the declared global lucide instance
    lucide.createIcons();
  }
}

function renderLogin() {
  return `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div class="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center">
        <div class="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <i data-lucide="graduation-cap" class="text-white w-8 h-8"></i>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Sistem Bimbingan KTI</h1>
        <p class="text-gray-500 mt-2 mb-8">Silakan pilih peran untuk masuk</p>
        <div class="space-y-3">
          <button data-role="SISWA" class="login-btn w-full p-4 flex items-center justify-between bg-blue-50 rounded-xl hover:bg-blue-100 transition-all border-2 border-transparent hover:border-blue-200">
            <span class="font-semibold text-gray-800">Login Siswa</span>
            <i data-lucide="chevron-right" class="text-blue-500"></i>
          </button>
          <button data-role="MENTOR" class="login-btn w-full p-4 flex items-center justify-between bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all border-2 border-transparent hover:border-indigo-200">
            <span class="font-semibold text-gray-800">Login Mentor</span>
            <i data-lucide="chevron-right" class="text-indigo-500"></i>
          </button>
          <button data-role="PEMBINA" class="login-btn w-full p-4 flex items-center justify-between bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all border-2 border-transparent hover:border-emerald-200">
            <span class="font-semibold text-gray-800">Login Pembina</span>
            <i data-lucide="chevron-right" class="text-emerald-500"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderSidebar() {
  const menuItems = {
    SISWA: [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
      { id: 'upload', label: 'Upload & Status', icon: 'upload' },
      { id: 'chat', label: 'Chat Mentor', icon: 'message-square' },
      { id: 'assistant', label: 'Asisten AI Pro', icon: 'bot' },
      { id: 'references', label: 'Referensi', icon: 'book-open' }
    ],
    MENTOR: [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
      { id: 'review', label: 'Review KTI', icon: 'file-text' },
      { id: 'chat', label: 'Bimbingan', icon: 'message-square' }
    ],
    PEMBINA: [
      { id: 'dashboard', label: 'Monitoring', icon: 'bar-chart-3' },
      { id: 'users', label: 'Data Siswa', icon: 'users' }
    ]
  };

  const items = menuItems[state.currentUser.role] || [];
  const isOpen = state.isSidebarOpen;

  return `
    <aside class="bg-white border-r border-gray-200 h-screen fixed left-0 top-0 transition-all duration-300 z-50 flex flex-col ${isOpen ? 'w-64' : 'w-20'} shadow-lg">
      <button id="toggle-sidebar" class="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 hover:text-blue-600 shadow-sm">
        <i data-lucide="${isOpen ? 'chevron-left' : 'chevron-right'}" class="w-4 h-4"></i>
      </button>
      <div class="p-6 border-b border-gray-100 flex items-center ${isOpen ? 'space-x-3' : 'justify-center'}">
        <div class="bg-blue-600 p-2 rounded-lg"><i data-lucide="book-open" class="text-white w-6 h-6"></i></div>
        ${isOpen ? '<h1 class="font-bold text-gray-800 truncate">Sistem KTI</h1>' : ''}
      </div>
      <nav class="flex-1 p-3 space-y-2 overflow-y-auto">
        ${items.map(item => `
          <button data-tab="${item.id}" class="nav-item w-full flex items-center p-3 rounded-lg transition-all ${state.activeTab === item.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}">
            <i data-lucide="${item.icon}" class="w-5 h-5 flex-shrink-0"></i>
            ${isOpen ? `<span class="ml-3 truncate">${item.label}</span>` : ''}
          </button>
        `).join('')}
      </nav>
      <div class="p-4 border-t border-gray-100">
        <button id="logout-btn" class="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-all">
          <i data-lucide="log-out" class="w-5 h-5"></i>
          ${isOpen ? '<span class="ml-3">Keluar</span>' : ''}
        </button>
      </div>
    </aside>
  `;
}

function renderHeader() {
  return `
    <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Halo, ${state.currentUser.name}</h1>
        <p class="text-sm text-gray-500">${state.currentUser.role}</p>
      </div>
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${state.currentUser.name}" class="w-10 h-10 rounded-full border bg-white" />
    </header>
  `;
}

function renderTabContent() {
  switch (state.activeTab) {
    case 'dashboard': return `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div class="p-3 bg-blue-500 rounded-lg text-white"><i data-lucide="file-text"></i></div>
          <div><p class="text-sm text-gray-500">Progres</p><h3 class="text-xl font-bold">40%</h3></div>
        </div>
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div class="p-3 bg-orange-500 rounded-lg text-white"><i data-lucide="clock"></i></div>
          <div><p class="text-sm text-gray-500">Menunggu</p><h3 class="text-xl font-bold">1 Sesi</h3></div>
        </div>
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div class="p-3 bg-green-500 rounded-lg text-white"><i data-lucide="check-circle"></i></div>
          <div><p class="text-sm text-gray-500">Approved</p><h3 class="text-xl font-bold">2 Bab</h3></div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 class="font-bold text-gray-800 mb-4">Aktivitas Terkini</h3>
        <div class="space-y-4">
          <div class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
             <i data-lucide="upload" class="w-4 h-4 text-blue-500"></i>
             <p class="text-sm text-gray-700 font-medium">Anda baru saja mengunggah Bab 1 Revisi</p>
             <span class="text-xs text-gray-400 ml-auto">Baru saja</span>
          </div>
        </div>
      </div>
    `;
    case 'chat': return `
      <div class="bg-white rounded-xl border h-[600px] flex flex-col shadow-sm">
        <div class="p-4 border-b flex items-center gap-3">
          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h3 class="font-bold">Mentor AI Virtual</h3>
        </div>
        <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          ${state.messages.map(m => `
            <div class="flex ${m.isAi ? 'justify-start' : 'justify-end'}">
              <div class="max-w-[80%] p-3 rounded-xl shadow-sm ${m.isAi ? 'bg-white text-gray-800' : 'bg-blue-600 text-white'}">
                <p class="text-sm">${m.text}</p>
              </div>
            </div>
          `).join('')}
        </div>
        <form id="chat-form" class="p-4 border-t flex gap-2">
          <input id="chat-input" class="flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tanya sesuatu..." />
          <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><i data-lucide="send" class="w-5 h-5"></i></button>
        </form>
      </div>
    `;
    case 'assistant': return `
       <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          <div class="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold flex items-center gap-2"><i data-lucide="bot" class="text-purple-600"></i> Asisten Pro</h3>
              <label class="flex items-center gap-2 cursor-pointer">
                <span class="text-xs text-gray-500">Thinking Mode</span>
                <input type="checkbox" id="thinking-mode" class="w-4 h-4 text-purple-600" />
              </label>
            </div>
            <div id="image-preview-container" class="hidden mb-4 relative">
              <img id="image-preview" class="h-32 rounded-lg border w-full object-cover" />
              <button id="remove-img" class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><i data-lucide="x" class="w-3 h-3"></i></button>
            </div>
            <textarea id="assistant-input" class="flex-1 border p-3 rounded-lg resize-none mb-4 outline-none focus:ring-2 focus:ring-purple-500" placeholder="Tulis instruksi atau lampirkan gambar grafik penelitian..."></textarea>
            <div class="flex gap-2">
              <input type="file" id="ai-file" class="hidden" accept="image/*" />
              <button id="btn-file" class="border p-2 rounded-lg text-gray-500 hover:bg-gray-50"><i data-lucide="image"></i></button>
              <button id="btn-assistant" class="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg font-bold shadow-md hover:opacity-90 transition-all flex justify-center items-center gap-2">
                <span id="btn-text">Mulai Analisis</span>
                <div id="btn-loader" class="hidden loader w-4 h-4 border-2 border-white rounded-full"></div>
              </button>
            </div>
          </div>
          <div class="bg-white p-6 rounded-xl border shadow-sm overflow-y-auto">
            <h3 class="font-bold text-gray-400 mb-4">Hasil Analisis</h3>
            <div id="assistant-output" class="text-gray-700 prose prose-sm leading-relaxed whitespace-pre-wrap">Silakan ajukan pertanyaan untuk melihat hasil.</div>
          </div>
       </div>
    `;
    case 'references': return `
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold">Generator Referensi</h3>
        <button id="gen-ref-btn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm">
          <i data-lucide="sparkles"></i> Cari Referensi AI
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="ref-list">
        ${state.references.map(r => `
          <div class="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <div class="p-2 bg-purple-50 text-purple-600 w-fit rounded mb-4"><i data-lucide="book" class="w-4 h-4"></i></div>
            <h4 class="font-bold text-gray-800 mb-1">${r.title}</h4>
            <p class="text-sm text-gray-500 mb-3">${r.author} (${r.year})</p>
            <button class="w-full text-xs border p-2 rounded hover:bg-gray-50">Unduh Fulltext</button>
          </div>
        `).join('')}
      </div>
    `;
    default: return '<p class="text-center p-20 text-gray-400">Halaman sedang dalam pengembangan.</p>';
  }
}

// --- EVENT HANDLERS ---
function attachLoginEvents() {
  document.querySelectorAll('.login-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = (btn as HTMLElement).dataset.role;
      state.currentUser = { name: role === 'SISWA' ? 'Andi Saputra' : role === 'MENTOR' ? 'Dr. Budi' : 'Admin KTI', role };
      render();
    });
  });
}

function attachAppEvents() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab = (btn as HTMLElement).dataset.tab;
      render();
    });
  });

  document.getElementById('toggle-sidebar')?.addEventListener('click', () => {
    state.isSidebarOpen = !state.isSidebarOpen;
    render();
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    state.currentUser = null;
    state.activeTab = 'dashboard';
    render();
  });

  // Chat Tab
  const chatForm = document.getElementById('chat-form');
  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = (document.getElementById('chat-input') as HTMLInputElement);
      const text = input.value.trim();
      if (!text) return;

      state.messages.push({ sender: 'USER', text, isAi: false, time: new Date() });
      input.value = '';
      render();

      const response = await callGemini('gemini-3-flash-preview', text, "Anda adalah mentor akademik virtual.");
      state.messages.push({ sender: 'AI', text: response, isAi: true, time: new Date() });
      render();
    });
  }

  // Assistant Tab
  const btnAssistant = document.getElementById('btn-assistant');
  const aiFileInput = document.getElementById('ai-file') as HTMLInputElement;
  const btnFile = document.getElementById('btn-file');
  let selectedImgData = null;

  if (btnFile) btnFile.addEventListener('click', () => aiFileInput.click());
  if (aiFileInput) aiFileInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files[0];
    if (file) {
      selectedImgData = await fileToBase64(file);
      const preview = document.getElementById('image-preview') as HTMLImageElement;
      preview.src = URL.createObjectURL(file);
      document.getElementById('image-preview-container').classList.remove('hidden');
    }
  });

  if (btnAssistant) {
    btnAssistant.addEventListener('click', async () => {
      const input = (document.getElementById('assistant-input') as HTMLTextAreaElement).value;
      const thinking = (document.getElementById('thinking-mode') as HTMLInputElement).checked;
      if (!input && !selectedImgData) return;

      const btnText = document.getElementById('btn-text');
      const btnLoader = document.getElementById('btn-loader');
      const output = document.getElementById('assistant-output');

      btnText.innerText = 'Menganalisis...';
      btnLoader.classList.remove('hidden');
      btnAssistant.setAttribute('disabled', 'true');

      const response = await callGemini(
        'gemini-3-pro-preview', 
        input || "Tolong jelaskan gambar ini secara mendalam untuk kebutuhan KTI.",
        "Anda adalah pakar penelitian KTI. Gunakan bahasa ilmiah yang baku.",
        thinking,
        selectedImgData
      );

      output.innerText = response;
      btnText.innerText = 'Mulai Analisis';
      btnLoader.classList.add('hidden');
      btnAssistant.removeAttribute('disabled');
    });
  }

  // References Tab
  const genRefBtn = document.getElementById('gen-ref-btn');
  if (genRefBtn) {
    genRefBtn.addEventListener('click', async () => {
      const topic = prompt("Masukkan topik penelitian (misal: 'Dampak AI pada Pendidikan'):");
      if (!topic) return;

      genRefBtn.innerHTML = `<div class="loader w-4 h-4 border-2 border-white rounded-full"></div> Mencari...`;
      
      const promptText = `Berikan 3 referensi ilmiah (Buku/Jurnal) valid tentang "${topic}". 
      Format HARUS JSON murni tanpa markdown: 
      [{"title": "...", "author": "...", "year": "..."}]`;

      const response = await callGemini('gemini-3-flash-preview', promptText);
      try {
        const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
        const newRefs = JSON.parse(cleaned);
        state.references = [...newRefs, ...state.references];
        render();
      } catch (e) {
        alert("Gagal memformat data referensi. Silakan coba lagi.");
        render();
      }
    });
  }
}

// --- INIT ---
render();
