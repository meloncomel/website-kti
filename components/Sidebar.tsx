import React from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Upload, 
  LogOut, 
  Users,
  BarChart3,
  Bot,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentRole, 
  activeTab, 
  setActiveTab, 
  onLogout, 
  isOpen, 
  toggleSidebar 
}) => {
  
  const getMenuItems = () => {
    switch (currentRole) {
      case UserRole.SISWA:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'upload', label: 'Upload & Status', icon: Upload },
          { id: 'bimbingan', label: 'Chat Pembimbing', icon: MessageSquare },
          { id: 'assistant', label: 'Asisten AI', icon: Bot },
          { id: 'tools', label: 'Cek Tata Bahasa', icon: CheckCircle },
          { id: 'referensi', label: 'Referensi', icon: BookOpen },
        ];
      case UserRole.MENTOR:
        return [
          { id: 'dashboard', label: 'Dashboard Mentor', icon: LayoutDashboard },
          { id: 'review', label: 'Review KTI', icon: FileText },
          { id: 'bimbingan', label: 'Chat Siswa', icon: MessageSquare },
          { id: 'referensi', label: 'Bank Referensi', icon: BookOpen },
        ];
      case UserRole.PEMBINA:
        return [
          { id: 'dashboard', label: 'Monitoring Utama', icon: BarChart3 },
          { id: 'users', label: 'Data Siswa', icon: Users },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div 
      className={`bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0 z-10 transition-all duration-300 ease-in-out shadow-lg ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:bg-gray-50 text-gray-500 hover:text-blue-600 transition-colors z-20 focus:outline-none"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Header / Logo */}
      <div className={`p-6 border-b border-gray-100 flex items-center transition-all duration-300 ${isOpen ? 'space-x-3' : 'justify-center'} overflow-hidden whitespace-nowrap`}>
        <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0 transition-transform duration-300 hover:scale-105">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 w-auto ml-0' : 'opacity-0 w-0 ml-0 overflow-hidden'}`}>
          <h1 className="text-lg font-bold text-gray-800">Sistem KTI</h1>
          <p className="text-xs text-gray-500">Bimbingan Online</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2 overflow-x-hidden scrollbar-hide">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center transition-all duration-200 group relative rounded-lg
              ${isOpen ? 'px-4 py-3 justify-start' : 'p-3 justify-center'}
              ${activeTab === item.id
                ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
              activeTab === item.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
            }`} />
            
            <span className={`whitespace-nowrap transition-all duration-300 ease-in-out origin-left
              ${isOpen ? 'opacity-100 w-auto translate-x-0 ml-3' : 'opacity-0 w-0 -translate-x-4 overflow-hidden ml-0'}`}>
              {item.label}
            </span>

            {/* Tooltip on hover when collapsed */}
            {!isOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onLogout}
          className={`w-full flex items-center transition-all duration-200 group relative rounded-lg text-red-600 hover:bg-red-50
            ${isOpen ? 'px-4 py-3 justify-start' : 'p-3 justify-center'}
          `}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className={`whitespace-nowrap transition-all duration-300 ease-in-out
            ${isOpen ? 'opacity-100 w-auto translate-x-0 ml-3' : 'opacity-0 w-0 -translate-x-4 overflow-hidden ml-0'}`}>
            Keluar
          </span>
          
          {!isOpen && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
              Keluar
            </div>
          )}
        </button>
      </div>
    </div>
  );
};