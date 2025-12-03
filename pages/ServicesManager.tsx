

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Link as LinkIcon,
  X,
  Loader2,
  FileText
} from 'lucide-react';
import { ServiceItem } from '../types';
import { supabase } from '../lib/supabase';

const ServicesManager: React.FC = () => {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ServiceItem>>({
      title: '', fileUrl: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('id', { ascending: false });
    
    if (data) {
      setItems(data.map(item => ({ id: item.id, title: item.title, fileUrl: item.file_url })));
    }
    if (error) console.error(error);
    setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا النموذج؟')) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (!error) {
        setItems(items.filter(item => item.id !== id));
      }
    }
  };

  const handleEdit = (item: ServiceItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

   const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
        title: '',
        fileUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
        title: formData.title,
        file_url: formData.fileUrl
    };

    let error;
    if (editingItem) {
        const { error: err } = await supabase.from('services').update(payload).eq('id', editingItem.id);
        error = err;
    } else {
        const { error: err } = await supabase.from('services').insert([payload]);
        error = err;
    }
    
    setIsSaving(false);
    if (!error) {
        fetchServices();
        setIsModalOpen(false);
    }
  };

  return (
    <div>
      {/* Green Banner */}
      <div className="bg-primary-700 -mx-6 -mt-6 mb-8 p-8 text-center relative shadow-md">
        <h1 className="text-3xl font-bold text-white mb-2">إدارة الخدمات والنماذج</h1>
        <p className="text-primary-100 text-lg">إدارة نماذج المعاملات والملفات القابلة للتحميل</p>
        
        <div className="mt-4 md:mt-0 md:absolute md:top-1/2 md:left-8 md:transform md:-translate-y-1/2">
            <button 
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-white text-primary-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-bold shadow-sm"
            >
                <Plus size={20} />
                <span>إضافة نموذج</span>
            </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-600 text-sm font-semibold border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4">اسم النموذج</th>
                        <th className="px-6 py-4">الرابط</th>
                        <th className="px-6 py-4">إجراءات</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {items.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText size={20} />
                                </div>
                                <span className="font-semibold text-gray-800">{item.title}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline flex items-center gap-1 text-sm">
                                <LinkIcon size={14} />
                                عرض الملف
                            </a>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleEdit(item)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="تعديل"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="حذف"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                لا توجد نماذج مضافة حالياً.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

       {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                         {editingItem ? 'تعديل النموذج' : 'إضافة نموذج جديد'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم النموذج</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="مثال: طلب رخصة بناء"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رابط الملف (PDF/Doc)</label>
                        <input 
                            type="url" 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                            value={formData.fileUrl}
                            onChange={e => setFormData({...formData, fileUrl: e.target.value})}
                            placeholder="https://..."
                            dir="ltr"
                        />
                         <p className="text-xs text-gray-500 mt-1">قم برفع الملف على Google Drive أو Dropbox وانسخ الرابط هنا.</p>
                    </div>

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
                             <span>{isSaving ? 'جاري الحفظ...' : 'حفظ'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManager;