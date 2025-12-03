
import React, { useState } from 'react';
import { MemoryRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Megaphone, 
  Newspaper, 
  MessageSquare, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  Image as ImageIcon,
  ExternalLink,
  FileText,
  LayoutTemplate
} from 'lucide-react';

// Import Pages
import Dashboard from './pages/Dashboard';
import NewsManager from './pages/NewsManager';
import AnnouncementsManager from './pages/AnnouncementsManager';
import Messagesbox from './pages/Messagesbox';
import GalleryManager from './pages/GalleryManager';
import ServicesManager from './pages/ServicesManager';
import SettingsPage from './pages/Settings';
import HomepageManager from './pages/HomepageManager';

// --- Layout Components ---

const SidebarItem = ({ 
  to, 
  icon, 
  label, 
  active 
}: { 
  to: string; 
  icon: React.ReactNode; 
  label: string; 
  active: boolean 
}) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
      active 
        ? 'bg-primary-700 text-white shadow-md' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-primary-700'
    }`}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </Link>
);

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 right-0 z-30 w-64 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-20 border-b border-gray-100 bg-primary-700">
            <div className="flex items-center gap-2 text-white">
                <div className="bg-white p-1 rounded-full">
                    <img src="https://picsum.photos/40/40" alt="Logo" className="w-8 h-8 rounded-full" />
                </div>
                <h1 className="text-xl font-bold">بلدية زان</h1>
            </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-5rem)] flex flex-col">
          <div className="mb-6">
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">القائمة الرئيسية</p>
            <SidebarItem 
              to="/" 
              icon={<LayoutDashboard size={20} />} 
              label="لوحة القيادة" 
              active={location.pathname === '/'} 
            />
            <SidebarItem 
              to="/homepage" 
              icon={<LayoutTemplate size={20} />} 
              label="واجهة الموقع" 
              active={location.pathname === '/homepage'} 
            />
            <SidebarItem 
              to="/news" 
              icon={<Newspaper size={20} />} 
              label="الأخبار والمشاريع" 
              active={location.pathname === '/news'} 
            />
            <SidebarItem 
              to="/announcements" 
              icon={<Megaphone size={20} />} 
              label="الاعلانات" 
              active={location.pathname === '/announcements'} 
            />
            <SidebarItem 
              to="/services" 
              icon={<FileText size={20} />} 
              label="الخدمات والنماذج" 
              active={location.pathname === '/services'} 
            />
             <SidebarItem 
              to="/gallery" 
              icon={<ImageIcon size={20} />} 
              label="معرض الصور" 
              active={location.pathname === '/gallery'} 
            />
            <SidebarItem 
              to="/messages" 
              icon={<MessageSquare size={20} />} 
              label="الرسائل الواردة" 
              active={location.pathname === '/messages'} 
            />
          </div>

          <div>
             <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">النظام</p>
            <SidebarItem 
              to="/settings" 
              icon={<SettingsIcon size={20} />} 
              label="الإعدادات" 
              active={location.pathname === '/settings'} 
            />
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100">
             <a 
               href="site/index.html" 
               target="_blank"
               className="flex items-center gap-3 px-4 py-3 text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors mb-2"
             >
              <ExternalLink size={20} />
              <span className="font-semibold">زيارة الموقع</span>
            </a>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              <LogOut size={20} />
              <span className="font-semibold">تسجيل الخروج</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-20 px-6 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar} 
              className="p-2 text-gray-600 bg-gray-100 rounded-lg lg:hidden hover:bg-gray-200"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 hidden sm:block">
               مرحباً، المسؤول
            </h2>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3">
                <div className="text-left hidden md:block">
                    <p className="text-sm font-bold text-gray-700">المسؤول العام</p>
                    <p className="text-xs text-gray-500">admin@zan.gov.lb</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm">
                    م
                </div>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// --- Main App ---
const App: React.FC = () => {
  return (
    <MemoryRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/homepage" element={<HomepageManager />} />
          <Route path="/news" element={<NewsManager />} />
          <Route path="/announcements" element={<AnnouncementsManager />} />
          <Route path="/services" element={<ServicesManager />} />
          <Route path="/messages" element={<Messagesbox />} />
          <Route path="/gallery" element={<GalleryManager />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </MemoryRouter>
  );
};

export default App;
