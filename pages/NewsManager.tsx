
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Filter,
  X,
  Loader2,
  Link as LinkIcon
} from 'lucide-react';
import { NewsItem } from '../types';
import ImageUploader from '../components/ImageUploader';
import { supabase } from '../lib/supabase';

const NewsManager: React.FC = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<NewsItem>>({
    title: '',
    date: '',
    description: '',
    category: 'news',
    status: 'draft',
    imageUrl: '',
    link: ''
  });

  // Fetch Data
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false });
    
    if (data) {
      // Map snake_case to camelCase
      const formattedData = data.map(item => ({
        ...item,
        imageUrl: item.image_url,
        link: item.link
      }));
      setItems(formattedData);
    }
    if (error) console.error('Error fetching news:', error);
    setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (!error) {
        setItems(items.filter(item => item.id !== id));
      } else {
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const handleEdit = (item: NewsItem) => {
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
        category: 'news',
        status: 'draft',
        imageUrl: '',
        link: ''
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
      category: formData.category,
      status: formData.status,
      image_url: formData.imageUrl || '',
      link: formData.link
    };

    let error;
    
    if (editingItem) {
        const { error: updateError } = await supabase
          .from('news')
          .update(payload)
          .eq('id', editingItem.id);
        error = updateError;
    } else {
        const { error: insertError } = await supabase
          .from('news')
          .insert([payload]);
        error = insertError;
    }

    setIsSaving(false);

    if (!error) {
        fetchNews(); // Refresh list
        setIsModalOpen(false);
    } else {
        console.error(error);
        alert('حدث خطأ أثناء الحفظ');
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Green Banner */}
      <div className="bg-primary-700 -mx-6 -mt-6 mb-8 p-8 text-center relative shadow-md">
        <h1 className="text-3xl font-bold text-white mb-2">إدارة الأخبار والمشاريع</h1>
        <p className="text-primary-100 text-lg">أضف وعدل الأخبار، المشاريع، والنشاطات</p>
        
        <div className="mt-4 md:mt-0 md:absolute md:top-1/2 md:left-8 md:transform md:-translate-y-1/2">
            <button 
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-white text-primary-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-bold shadow-sm"
            >
                <Plus size={20} />
                <span>إضافة جديد</span>
            </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="بحث في العنوان أو الوصف..." 
            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 bg-white">
            <Filter size={18} />
            <span>تصفية</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
        {isLoading ? (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead className="bg-gray-50 text-gray-600 text-sm font-semibold border-b border-gray-200">
                <tr>
                    <th className="px-6 py-4">الصورة</th>
                    <th className="px-6 py-4">العنوان</th>
                    <th className="px-6 py-4">التصنيف</th>
                    <th className="px-6 py-4">التاريخ</th>
                    <th className="px-6 py-4">الحالة</th>
                    <th className="px-6 py-4">إجراءات</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                        <img src={item.imageUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} alt={item.title} className="w-16 h-12 object-cover rounded-md bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <p className="font-semibold text-gray-800 line-clamp-1">{item.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                            {item.link && (
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                    <LinkIcon size={10} /> رابط خارجي
                                </a>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                            item.category === 'projects' ? 'bg-blue-100 text-blue-700' :
                            item.category === 'events' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                            {item.category === 'projects' ? 'مشاريع' : item.category === 'events' ? 'نشاطات' : 'أخبار'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full border ${
                            item.status === 'published' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                            {item.status === 'published' ? 'منشور' : 'مسودة'}
                        </span>
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
                </tbody>
            </table>
            </div>
        )}
        {!isLoading && filteredItems.length === 0 && (
            <div className="p-8 text-center text-gray-500">
                لا توجد نتائج مطابقة للبحث.
            </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        {editingItem ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                            <input 
                                type="date" 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                            <select 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value as any})}
                            >
                                <option value="news">أخبار</option>
                                <option value="projects">مشاريع</option>
                                <option value="events">نشاطات</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                            <select 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value as any})}
                            >
                                <option value="published">منشور</option>
                                <option value="draft">مسودة</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                        <textarea 
                            rows={4}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رابط خارجي (اختياري)</label>
                         <input 
                            type="url" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                            value={formData.link || ''}
                            onChange={e => setFormData({...formData, link: e.target.value})}
                            placeholder="https://"
                            dir="ltr"
                        />
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

export default NewsManager;