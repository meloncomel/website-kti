import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { UserRole, User, SubmissionStatus, Submission, Reference, ChatMessage } from './types';
import { 
  User as UserIcon, 
  GraduationCap, 
  ShieldCheck, 
  Send, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Upload,
  Search,
  Sparkles,
  ChevronRight,
  BookOpen,
  BrainCircuit,
  Image as ImageIcon,
  X,
  Loader2,
  Plus
} from 'lucide-react';
import { 
  consultWithAiAssistant, 
  checkGrammarAndStyle, 
  chatWithMentorAi, 
  fileToBase64,
  generateReferences
} from './services/geminiService';

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Andi Saputra', role: UserRole.SISWA, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi' },
  { id: 'u2', name: 'Dr. Budi Santoso', role: UserRole.MENTOR, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi' },
  { id: 'u3', name: 'Siti Aminah, M.Pd', role: UserRole.PEMBINA, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti' },
];

const MOCK_SUBMISSIONS: Submission[] = [
  { id: 's1', title: 'Analisis Kualitas Air Sungai Ciliwung', studentName: 'Andi Saputra', date: '2023-10-15', status: SubmissionStatus.REVISION, chapter: 'BAB 1', feedback: 'Perbaiki latar belakang masalah, data kurang spesifik.', fileUrl: '#' },
  { id: 's2', title: 'Implementasi IoT pada Pertanian Cabai', studentName: 'Budi Utomo', date: '2023-10-16', status: SubmissionStatus.APPROVED, chapter: 'BAB 1', fileUrl: '#' },
  { id: 's3', title: 'Analisis Kualitas Air Sungai Ciliwung', studentName: 'Andi Saputra', date: '2023-10-20', status: SubmissionStatus.PENDING, chapter: 'BAB 2', fileUrl: '#' },
];

const INITIAL_REFERENCES: Reference[] = [
  { id: 'r1', title: 'Metode Penelitian Kuantitatif', author: 'Sugiyono', year: '2019', type: 'Buku', url: '#' },
  { id: 'r2', title: 'Digital Transformation in Education', author: 'Smith, J.', year: '2022', type: 'Jurnal', url: '#' },
];

// --- COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow duration-200">
    <div className={`p-3 rounded-lg ${color} bg-opacity-90`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const LoginScreen = ({ onLogin }: { onLogin: (role: UserRole) => void }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Sistem Bimbingan KTI</h1>
          <p className="text-gray-500 mt-2">Masuk untuk melanjutkan aktivitas</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onLogin(UserRole.SISWA)}
            className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-blue-50 hover:bg-blue-100 hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Login Siswa</h3>
                <p className="text-xs text-gray-500">Akses bimbingan & materi</p>
              </div>
            </div>
            <ChevronRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => onLogin(UserRole.MENTOR)}
            className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-200 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Login Mentor</h3>
                <p className="text-xs text-gray-500">Review & bimbingan siswa</p>
              </div>
            </div>
            <ChevronRight className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => onLogin(UserRole.PEMBINA)}
            className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-200 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Login Pembina</h3>
                <p className="text-xs text-gray-500">Monitoring progres</p>
              </div>
            </div>
            <ChevronRight className="text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ role }: { role: UserRole }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard {role === UserRole.SISWA ? 'Siswa' : role === UserRole.MENTOR ? 'Mentor' : 'Pembina'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {role === UserRole.SISWA && (
          <>
            <StatCard title="Progres KTI" value="40%" icon={FileText} color="bg-blue-500" />
            <StatCard title="Revisi Pending" value="1" icon={AlertCircle} color="bg-orange-500" />
            <StatCard title="Bimbingan" value="12 Sesi" icon={Clock} color="bg-green-500" />
          </>
        )}
        {role === UserRole.MENTOR && (
          <>
            <StatCard title="Siswa Bimbingan" value="5" icon={UserIcon} color="bg-blue-500" />
            <StatCard title="Menunggu Review" value="3" icon={Clock} color="bg-orange-500" />
            <StatCard title="KTI Selesai" value="2" icon={CheckCircle2} color="bg-green-500" />
          </>
        )}
        {role === UserRole.PEMBINA && (
          <>
            <StatCard title="Total Siswa" value="150" icon={UserIcon} color="bg-blue-500" />
            <StatCard title="Total Judul ACC" value="85" icon={CheckCircle2} color="bg-green-500" />
            <StatCard title="Mentor Aktif" value="12" icon={GraduationCap} color="bg-purple-500" />
          </>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0 hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {role === UserRole.SISWA ? 'Anda mengupload BAB 1 Revisi' : 'Andi Saputra mengupload BAB 2'}
                </p>
                <p className="text-xs text-gray-500">2 jam yang lalu</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UploadView = ({ role }: { role: UserRole }) => {
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [file, setFile] = useState<File | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      alert("Fitur upload simulasi berhasil. File dikirim ke mentor.");
      setFile(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === submissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(submissions.map(s => s.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchAction = (action: 'approve' | 'revision') => {
    setSubmissions(prev => prev.map(sub => {
      if (selectedIds.includes(sub.id)) {
        return {
          ...sub,
          status: action === 'approve' ? SubmissionStatus.APPROVED : SubmissionStatus.REVISION,
          feedback: action === 'revision' ? 'Dokumen perlu revisi (Batch).' : sub.feedback
        };
      }
      return sub;
    }));
    const count = selectedIds.length;
    setSelectedIds([]);
    alert(`${count} dokumen berhasil ${action === 'approve' ? 'disetujui' : 'ditandai revisi'}.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{role === UserRole.SISWA ? 'Upload KTI' : 'Review KTI'}</h2>
        {role === UserRole.SISWA && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">Semester Genap 2024</span>
        )}
      </div>

      {role === UserRole.MENTOR && selectedIds.length > 0 && (
        <div className="bg-white border border-blue-200 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{selectedIds.length} Terpilih</span>
            <span className="text-sm text-gray-500">Pilih tindakan massal:</span>
          </div>
          <div className="flex gap-3">
             <button
              onClick={() => handleBatchAction('revision')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              Minta Revisi
            </button>
            <button
              onClick={() => handleBatchAction('approve')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Setujui Semua
            </button>
          </div>
        </div>
      )}

      {role === UserRole.SISWA && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">Upload Dokumen Baru</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer block w-full h-full">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <span className="text-gray-600 font-medium">Klik untuk upload file (PDF/DOCX)</span>
                <p className="text-xs text-gray-400 mt-1">Maksimal 10MB</p>
                {file && <p className="mt-2 text-blue-600 font-semibold">File terpilih: {file.name}</p>}
              </label>
            </div>
            <div className="flex gap-4">
              <select className="flex-1 p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option>Pilih Bab (BAB 1 - 5)</option>
                <option>BAB 1: Pendahuluan</option>
                <option>BAB 2: Tinjauan Pustaka</option>
                <option>BAB 3: Metodologi</option>
              </select>
              <button type="submit" disabled={!file} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                Upload
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Riwayat & Status</h3>
           {role === UserRole.MENTOR && (
             <span className="text-xs text-gray-400 hidden sm:inline">Centang untuk aksi massal</span>
           )}
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              {role === UserRole.MENTOR && (
                <th className="p-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === submissions.length && submissions.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                  />
                </th>
              )}
              <th className="p-4">Judul & Bab</th>
              <th className="p-4">Siswa</th>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Status</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {submissions.map((sub) => (
              <tr key={sub.id} className={`transition-colors ${selectedIds.includes(sub.id) ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                {role === UserRole.MENTOR && (
                  <td className="p-4">
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(sub.id)}
                      onChange={() => handleSelectOne(sub.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                    />
                  </td>
                )}
                <td className="p-4">
                  <p className="font-medium text-gray-800">{sub.chapter}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{sub.title}</p>
                </td>
                <td className="p-4 text-sm">{sub.studentName}</td>
                <td className="p-4 text-sm text-gray-500">{sub.date}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    sub.status === SubmissionStatus.APPROVED ? 'bg-green-100 text-green-700' :
                    sub.status === SubmissionStatus.REVISION ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="p-4">
                  {role === UserRole.MENTOR ? (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-200">
                      <FileText className="w-3.5 h-3.5" />
                      Review
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {sub.status === SubmissionStatus.REVISION && (
                        <button 
                          onClick={() => alert(`Catatan Mentor: ${sub.feedback}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors border border-orange-200 shadow-sm"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          Lihat Catatan Revisi
                        </button>
                      )}
                      
                      {sub.status === SubmissionStatus.APPROVED && (
                        <button 
                          onClick={() => alert(`Mengunduh dokumen: ${sub.title}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Unduh
                        </button>
                      )}

                      {sub.status === SubmissionStatus.PENDING && (
                         <span className="text-gray-400 text-xs italic px-2">Menunggu Review</span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ChatView = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', senderId: 'u2', senderName: 'Mentor AI', text: 'Halo! Ada yang bisa saya bantu terkait KTI kamu hari ini?', timestamp: new Date(), isAi: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'u1', // Current user mock
      senderName: 'Saya',
      text: input,
      timestamp: new Date(),
      isAi: false
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Call Fast AI
    const aiResponseText = await chatWithMentorAi(input, []);
    
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      senderId: 'bot',
      senderName: 'Mentor AI',
      text: aiResponseText,
      timestamp: new Date(),
      isAi: true
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Mentor AI Virtual</h3>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Online (Fast Response)
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
              msg.isAi 
                ? 'bg-white border border-gray-200 rounded-tl-none text-gray-800' 
                : 'bg-blue-600 text-white rounded-tr-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <span className={`text-[10px] mt-1 block ${msg.isAi ? 'text-gray-400' : 'text-blue-100'}`}>
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-tl-none shadow-sm flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl">
        <form className="flex gap-2" onSubmit={handleSend}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pesan ke mentor..." 
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" disabled={!input || isTyping} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

const AiAssistantView = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !selectedImage) return;
    
    setLoading(true);
    setResponse('');
    
    let imageBase64: string | undefined = undefined;
    if (selectedImage) {
      imageBase64 = await fileToBase64(selectedImage);
    }

    const result = await consultWithAiAssistant(prompt, imageBase64, selectedImage?.type, useThinking);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Input Section */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Asisten Cerdas
          </h3>
          <p className="text-xs text-gray-500">Multimodal: Teks, Gambar & Deep Thinking</p>
        </div>
        
        <form onSubmit={handleAsk} className="flex-1 flex flex-col">
          {/* Controls */}
          <div className="flex items-center justify-between mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2">
              <BrainCircuit className={`w-4 h-4 ${useThinking ? 'text-purple-600' : 'text-gray-400'}`} />
              <span className={`text-xs font-medium ${useThinking ? 'text-purple-700' : 'text-gray-500'}`}>Deep Thinking</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={useThinking} onChange={() => setUseThinking(!useThinking)} className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative mb-3 group">
              <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
              <button 
                type="button" 
                onClick={removeImage}
                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="relative flex-1 mb-4">
            <textarea
              className="w-full h-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none pb-10"
              placeholder={selectedImage ? "Tanyakan sesuatu tentang gambar ini..." : "Tulis pertanyaan KTI Anda..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            {/* Image Upload Button Inside Textarea */}
            <div className="absolute bottom-2 right-2">
              <input type="file" id="ai-img-upload" accept="image/*" className="hidden" onChange={handleImageSelect} />
              <label htmlFor="ai-img-upload" className="p-2 text-gray-400 hover:text-purple-600 cursor-pointer bg-white rounded-full shadow-sm border border-gray-100 flex hover:bg-gray-50 transition-colors" title="Upload Gambar">
                <ImageIcon className="w-4 h-4" />
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || (!prompt && !selectedImage)}
            className={`w-full text-white py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-sm
              ${useThinking ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {useThinking ? 'Berpikir Keras...' : 'Memproses...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> 
                {useThinking ? 'Analisis Mendalam' : 'Kirim'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-y-auto">
        {response ? (
          <div className="prose prose-sm max-w-none">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Jawaban AI:
            </h4>
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-light">
              {response}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className={`p-4 rounded-full mb-4 ${useThinking ? 'bg-purple-50' : 'bg-gray-50'}`}>
              {useThinking ? <BrainCircuit className="w-8 h-8 text-purple-300" /> : <Sparkles className="w-8 h-8 text-gray-300" />}
            </div>
            <p className="text-sm">
              {useThinking 
                ? 'Mode "Thinking" aktif untuk analisis kompleks.' 
                : 'Upload gambar atau tulis pertanyaan untuk memulai.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const GrammarCheckView = () => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!text) return;
    setLoading(true);
    const result = await checkGrammarAndStyle(text);
    setAnalysis(result);
    setLoading(false);
  }

  return (
    <div className="grid grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Input Teks
        </h3>
        <textarea 
          className="flex-1 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-green-500 outline-none"
          placeholder="Tempel paragraf KTI Anda di sini untuk diperiksa tata bahasanya..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button 
          onClick={handleCheck}
          disabled={loading || !text}
          className="mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
          {loading ? 'Memeriksa...' : 'Cek Tata Bahasa'}
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 overflow-y-auto">
         <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" /> Hasil Analisis
        </h3>
        {analysis ? (
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {analysis}
          </div>
        ) : (
          <p className="text-gray-400 text-center mt-20">Belum ada hasil analisis.</p>
        )}
      </div>
    </div>
  )
}

const ReferencesView = () => {
  const [references, setReferences] = useState<Reference[]>(INITIAL_REFERENCES);
  const [showModal, setShowModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    
    setLoading(true);
    const resultJson = await generateReferences(topic);
    try {
      const newRefs = JSON.parse(resultJson);
      // Map to add IDs and ensure type safety
      const formattedRefs: Reference[] = newRefs.map((r: any, idx: number) => ({
        id: `gen-${Date.now()}-${idx}`,
        title: r.title,
        author: r.author,
        year: r.year,
        type: r.type || 'Jurnal',
        url: r.url || '#'
      }));
      
      setReferences(prev => [...formattedRefs, ...prev]);
      setShowModal(false);
      setTopic('');
    } catch (err) {
      alert("Gagal mengurai respons AI. Silakan coba topik yang lebih spesifik.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Referensi & Pustaka</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Cari Referensi AI
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Generator Referensi AI</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleGenerate}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topik Penelitian</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Misal: Dampak Media Sosial pada Remaja"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>}
                {loading ? 'Mencari...' : 'Cari Referensi'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {references.map((ref) => (
          <div key={ref.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg ${ref.type === 'Jurnal' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-400 font-medium">{ref.year}</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">{ref.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{ref.author}</p>
            <button className="w-full border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
              <Download className="w-4 h-4" /> Simpan / Unduh
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogin = (role: UserRole) => {
    const user = MOCK_USERS.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    setIsSidebarOpen(true); // Reset sidebar on logout
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView role={currentUser.role} />;
      case 'upload':
      case 'review':
        return <UploadView role={currentUser.role} />;
      case 'bimbingan':
        return <ChatView />;
      case 'assistant':
        return <AiAssistantView />;
      case 'tools':
        return <GrammarCheckView />;
      case 'referensi':
        return <ReferencesView />;
      case 'users':
        return <div className="text-center p-10 text-gray-500">Fitur Manajemen Data Siswa (Pembina)</div>;
      default:
        return <DashboardView role={currentUser.role} />;
    }
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      <Sidebar 
        currentRole={currentUser.role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className={`flex-1 p-8 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === 'dashboard' ? `Halo, ${currentUser.name}` : 
               activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
            </h1>
            <p className="text-sm text-gray-500">
              {currentUser.role === UserRole.SISWA ? 'Siswa' : currentUser.role === UserRole.MENTOR ? 'Guru Pembimbing' : 'Pembina'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
              <img 
                src={currentUser.avatar} 
                alt="Profile" 
                className="w-10 h-10 rounded-full"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;