

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';
import { Announcement } from '../types';
import ImageUploader from '../components/ImageUploader';
import { supabase } from '../lib/supabase';

const AnnouncementsManager: React.FC = () => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Announcement>>({
      title: '', date: '', description: '', priority: 'normal', imageUrl: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false });
    
    if (data) {
      setItems(data.map(item => ({...item, imageUrl: item.image_url})));
    }
    if (error) console.error(error);
    setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (!error) {
        setItems(items.filter(item => item.id !== id));
      }
    }
  };

  const handleEdit = (item: Announcement) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

   const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        priority: 'normal',
        imageUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
        title: formData.title,
        date: formData.date,
        description: formData.description,
        priority: formData.priority,
        image_url: formData.imageUrl || 'https://picsum.photos/200/200'
    };

    let error;
    if (editingItem) {
        const { error: err } = await supabase.from('announcements').update(payload).eq('id', editingItem.id);
        error = err;
    } else {
        const { error: err } = await supabase.from('announcements').insert([payload]);
        error = err;
    }
    
    setIsSaving(false);
    if (!error) {
        fetchAnnouncements();
        setIsModalOpen(false);
    }
  };

  return (
    <div>
      {/* Green Banner */}
      <div className="bg-primary-700 -mx-6 -mt-6 mb-8 p-8 text-center relative shadow-md">
        <h1 className="text-3xl font-bold text-white mb-2">إدارة الإعلانات</h1>
        <p className="text-primary-100 text-lg">نشر تنبيهات وإعلانات للمواطنين</p>
        
        <div className="mt-4 md:mt-0 md:absolute md:top-1/2 md:left-8 md:transform md:-translate-y-1/2">
            <button 
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-white text-primary-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-bold shadow-sm"
            >
                <Plus size={20} />
                <span>إضافة إعلان</span>
            </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="relative h-40 bg-gray-100">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1 ${item.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}`}>
                        {item.priority === 'high' ? <AlertTriangle size={12}/> : <CheckCircle2 size={12}/>}
                        {item.priority === 'high' ? 'هام جداً' : 'عادي'}
                    </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-400">{item.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">{item.description}</p>
                    
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                        <button 
                            onClick={() => handleEdit(item)}
                            className="flex-1 py-2 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Edit2 size={16} /> تعديل
                        </button>
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="flex-1 py-2 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Trash2 size={16} /> حذف
                        </button>
                    </div>
                </div>
            </div>
            ))}
        </div>
      )}

       {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                         {editingItem ? 'تعديل الإعلان' : 'إعلان جديد'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الإعلان</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                            <input 
                                type="date" 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الأهمية</label>
                            <select 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                                value={formData.priority}
                                onChange={e => setFormData({...formData, priority: e.target.value as any})}
                            >
                                <option value="normal">عادي</option>
                                <option value="high">هام جداً</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نص الإعلان</label>
                        <textarea 
                            rows={4}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    <ImageUploader 
                      currentImage={formData.imageUrl} 
                      onImageSelect={(url) => setFormData({...formData, imageUrl: url})} 
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            إلغاء
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center gap-2"
                        >
                             {isSaving && <Loader2 size={16} className="animate-spin" />}
                             <span>{isSaving ? 'جاري الحفظ...' : 'حفظ ونشر'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsManager;