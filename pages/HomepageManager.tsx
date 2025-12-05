
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  X,
  Eye,
  EyeOff,
  Move,
  LayoutTemplate,
  Link as LinkIcon,
  Smartphone,
  Monitor
} from 'lucide-react';
import { SliderItem } from '../types';
import ImageUploader from '../components/ImageUploader';
import { supabase } from '../lib/supabase';

const HomepageManager: React.FC = () => {
  const [items, setItems] = useState<SliderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SliderItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<SliderItem>>({
      title: '', subtitle: '', imageUrl: '', mobileImageUrl: '', link: '', sortOrder: 0, active: true
  });

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('sliders')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (data) {
      setItems(data.map(item => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        imageUrl: item.image_url,
        mobileImageUrl: item.mobile_image_url, // Fetch mobile image
        link: item.link,
        sortOrder: item.sort_order,
        active: item.active
      })));
    }
    if (error) console.error(error);
    setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الشريحة؟')) {
      const { error } = await supabase.from('sliders').delete().eq('id', id);
      if (!error) {
        setItems(items.filter(item => item.id !== id));
      }
    }
  };

  const handleEdit = (item: SliderItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

   const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
        title: '',
        subtitle: '',
        imageUrl: '',
        mobileImageUrl: '',
        link: '',
        sortOrder: items.length + 1,
        active: true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        image_url: formData.imageUrl || '',
        mobile_image_url: formData.mobileImageUrl || '', // Save mobile image
        link: formData.link,
        sort_order: formData.sortOrder,
        active: formData.active
    };

    let error;
    if (editingItem) {
        const { error: err } = await supabase.from('sliders').update(payload).eq('id', editingItem.id);
        error = err;
    } else {
        const { error: err } = await supabase.from('sliders').insert([payload]);
        error = err;
    }
    
    setIsSaving(false);
    if (!error) {
        fetchSliders();
        setIsModalOpen(false);
    }
  };

  return (
    <div>
      {/* Green Banner */}
      <div className="bg-primary-700 -mx-6 -mt-6 mb-8 p-8 text-center relative shadow-md">
        <h1 className="text-3xl font-bold text-white mb-2">إدارة واجهة الموقع</h1>
        <p className="text-primary-100 text-lg">إعداد شرائح العرض (Slider) في الصفحة الرئيسية</p>
        
        <div className="mt-4 md:mt-0 md:absolute md:top-1/2 md:left-8 md:transform md:-translate-y-1/2">
            <button 
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-white text-primary-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-bold shadow-sm"
            >
                <Plus size={20} />
                <span>إضافة شريحة</span>
            </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map(item => (
            <div key={item.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col ${item.active ? 'border-gray-100' : 'border-gray-200 opacity-75'}`}>
                <div className="relative h-48 bg-gray-100 flex">
                     {/* Split view for desktop/mobile preview */}
                    <div className="w-2/3 h-full border-l border-white relative group">
                        <img src={item.imageUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-[10px] px-1 rounded flex items-center gap-1">
                            <Monitor size={10} /> سطح المكتب
                        </div>
                    </div>
                    <div className="w-1/3 h-full relative group bg-gray-200">
                         {item.mobileImageUrl ? (
                             <img src={item.mobileImageUrl} alt="Mobile" className="w-full h-full object-cover" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">
                                نفس الصورة
                             </div>
                         )}
                         <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-[10px] px-1 rounded flex items-center gap-1">
                            <Smartphone size={10} /> جوال
                        </div>
                    </div>

                    <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold bg-black bg-opacity-50 text-white flex items-center gap-1">
                        <Move size={12} />
                        ترتيب: {item.sortOrder}
                    </div>
                    {!item.active && (
                         <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
                            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                                <EyeOff size={16} /> غير مفعل
                            </span>
                         </div>
                    )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 flex-1">{item.subtitle}</p>
                    {item.link && (
                        <p className="text-xs text-blue-600 flex items-center gap-1 mb-4 truncate">
                            <LinkIcon size={12} /> {item.link}
                        </p>
                    )}
                    
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
            {items.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    <LayoutTemplate size={48} className="mx-auto mb-3 opacity-50" />
                    <p>لا توجد شرائح عرض حالياً. ابدأ بإضافة شريحة جديدة.</p>
                </div>
            )}
        </div>
      )}

       {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                         {editingItem ? 'تعديل الشريحة' : 'شريحة جديدة'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">العنوان الرئيسي</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">العنوان الفرعي</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                            value={formData.subtitle}
                            onChange={e => setFormData({...formData, subtitle: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الرابط (اختياري)</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                            value={formData.link}
                            onChange={e => setFormData({...formData, link: e.target.value})}
                            placeholder="https://..."
                            dir="ltr"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الترتيب</label>
                            <input 
                                type="number" 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                                value={formData.sortOrder}
                                onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
                            />
                        </div>
                         <div className="flex items-center pt-6">
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={formData.active}
                                    onChange={e => setFormData({...formData, active: e.target.checked})}
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                <span className="ms-3 text-sm font-medium text-gray-700">تفعيل الشريحة</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-gray-700">
                                <Monitor size={18} />
                                <span className="font-bold">عرض سطح المكتب</span>
                            </div>
                            <ImageUploader 
                                label="صورة أفقية (يفضل 1920x800)"
                                currentImage={formData.imageUrl} 
                                onImageSelect={(url) => setFormData({...formData, imageUrl: url})} 
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-gray-700">
                                <Smartphone size={18} />
                                <span className="font-bold">عرض الجوال</span>
                                <span className="text-xs font-normal text-gray-400">(اختياري)</span>
                            </div>
                            <ImageUploader 
                                label="صورة عمودية/مربعة (يفضل 800x800)"
                                currentImage={formData.mobileImageUrl} 
                                onImageSelect={(url) => setFormData({...formData, mobileImageUrl: url})} 
                            />
                             <p className="text-xs text-gray-400 mt-2">
                                إذا لم يتم اختيار صورة للجوال، سيتم استخدام صورة سطح المكتب لجميع الأجهزة.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
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

export default HomepageManager;