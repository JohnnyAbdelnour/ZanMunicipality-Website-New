

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Globe, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Lock, 
  Building,
  Loader2
} from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import { supabase } from '../lib/supabase';

const Settings: React.FC = () => {
  const [formData, setFormData] = useState({
    siteName: 'بلدية زان',
    siteDescription: 'الموقع الرسمي لبلدية زان - لبنان',
    email: 'zenmunicipality@gmail.com',
    phone: '+961 6 710 777',
    address: 'شارع البلدية، زان، لبنان',
    facebook: 'https://www.facebook.com/zenmunicipality',
    instagram: 'https://www.instagram.com/zenmunicipality/',
    logo: 'https://picsum.photos/200/200'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsFetching(true);
    const { data } = await supabase.from('settings').select('data').eq('id', 1).single();
    if (data && data.data) {
        setFormData(data.data);
    }
    setIsFetching(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Upsert settings with ID 1
    const { error } = await supabase
        .from('settings')
        .upsert({ id: 1, data: formData });

    setIsLoading(false);
    
    if (!error) {
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' });
    } else {
        setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
        console.error(error);
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  if (isFetching) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Green Banner */}
      <div className="bg-primary-700 -mx-6 -mt-6 mb-8 p-8 text-center relative shadow-md">
        <h1 className="text-3xl font-bold text-white mb-2">إعدادات النظام</h1>
        <p className="text-primary-100 text-lg">تكوين معلومات الموقع وبيانات الاتصال</p>
        
        <div className="mt-4 md:mt-0 md:absolute md:top-1/2 md:left-8 md:transform md:-translate-y-1/2">
            <button 
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 bg-white text-primary-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-bold shadow-sm disabled:opacity-50"
            >
                <Save size={20} />
                <span>{isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
            </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <span className="font-bold">{message.type === 'success' ? 'نجاح:' : 'خطأ:'}</span>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Globe className="text-primary-600" size={20} />
              معلومات عامة
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الموقع</label>
                <input 
                  type="text" 
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">وصف الموقع</label>
                <textarea 
                  name="siteDescription"
                  rows={3}
                  value={formData.siteDescription}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Phone className="text-primary-600" size={20} />
              معلومات الاتصال
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left bg-white"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left bg-white"
                  dir="ltr"
                />
              </div>
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Globe className="text-primary-600" size={20} />
              التواصل الاجتماعي
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">فيسبوك</label>
                <div className="flex gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Facebook size={20} /></div>
                  <input 
                    type="text" 
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-left bg-white"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">انستغرام</label>
                <div className="flex gap-2">
                  <div className="p-2 bg-pink-50 text-pink-600 rounded-lg"><Instagram size={20} /></div>
                  <input 
                    type="text" 
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-left bg-white"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
           {/* Logo Settings */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building className="text-primary-600" size={20} />
              شعار البلدية
            </h2>
             <ImageUploader 
               currentImage={formData.logo}
               onImageSelect={(url) => setFormData({...formData, logo: url})}
               label=""
             />
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;