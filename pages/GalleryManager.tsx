

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowRight,
  Video,
  Image as ImageIcon,
  FolderOpen,
  X,
  Play,
  Loader2
} from 'lucide-react';
import { Album, MediaItem } from '../types';
import ImageUploader from '../components/ImageUploader';
import MultiMediaUploader, { UploadedFile } from '../components/MultiMediaUploader';
import { supabase } from '../lib/supabase';

const GalleryManager: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  
  // Modals state
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  
  // Forms state
  const [albumForm, setAlbumForm] = useState({ title: '', coverUrl: '' });
  const [newMediaFiles, setNewMediaFiles] = useState<UploadedFile[]>([]);
  const [commonDescription, setCommonDescription] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    setIsLoading(true);
    // Fetch albums and their related items
    const { data, error } = await supabase
        .from('albums')
        .select(`
            *,
            items:media_items(*)
        `)
        .order('date', { ascending: false });

    if (data) {
        // Map database fields to our types
        const formattedAlbums = data.map((a: any) => ({
            id: a.id,
            title: a.title,
            coverUrl: a.cover_url,
            date: a.date,
            items: a.items || []
        }));
        setAlbums(formattedAlbums);
    }
    if (error) console.error(error);
    setIsLoading(false);
  };

  const openAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setCurrentView('detail');
  };

  const backToList = () => {
    setSelectedAlbum(null);
    setCurrentView('list');
    fetchAlbums(); // Refresh in case of changes
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { data, error } = await supabase
        .from('albums')
        .insert([{
            title: albumForm.title,
            cover_url: albumForm.coverUrl || 'https://picsum.photos/400/300?grayscale',
            date: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

    if (data) {
        setAlbums([{ ...data, items: [], coverUrl: data.cover_url }, ...albums]);
        setIsAlbumModalOpen(false);
        setAlbumForm({ title: '', coverUrl: '' });
    }
    setIsSaving(false);
  };

  const handleDeleteAlbum = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من حذف هذا الألبوم؟ سيتم حذف جميع الصور بداخله.')) {
        await supabase.from('albums').delete().eq('id', id);
        setAlbums(albums.filter(a => a.id !== id));
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum || newMediaFiles.length === 0) return;
    setIsSaving(true);

    const payloads = newMediaFiles.map(file => ({
        album_id: selectedAlbum.id,
        type: file.type,
        url: file.url,
        description: commonDescription || file.name // Use common description or filename
    }));

    const { data, error } = await supabase
        .from('media_items')
        .insert(payloads)
        .select();

    if (data) {
        const updatedItems = [...selectedAlbum.items, ...data];
        const updatedAlbum = {
            ...selectedAlbum,
            items: updatedItems
        };
        setSelectedAlbum(updatedAlbum);
        // Also update the main list in background
        setAlbums(albums.map(a => a.id === selectedAlbum.id ? updatedAlbum : a));
        
        setIsMediaModalOpen(false);
        setNewMediaFiles([]);
        setCommonDescription('');
    } else if (error) {
        alert('حدث خطأ أثناء حفظ الملفات. قد يكون حجم الملفات كبيراً جداً.');
        console.error(error);
    }
    setIsSaving(false);
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!selectedAlbum) return;
    if (window.confirm('حذف هذا العنصر؟')) {
        await supabase.from('media_items').delete().eq('id', mediaId);
        
        const updatedAlbum = {
            ...selectedAlbum,
            items: selectedAlbum.items.filter(i => i.id !== mediaId)
        };
        setSelectedAlbum(updatedAlbum);
        setAlbums(albums.map(a => a.id === selectedAlbum.id ? updatedAlbum : a));
    }
  };

  return (
    <div>
      {/* Green Banner */}
      <div className="bg-primary-700 -mx-6 -mt-6 mb-8 p-8 text-center relative shadow-md">
         {currentView === 'detail' && (
            <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
                <button 
                onClick={backToList}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors border border-transparent"
                title="عودة"
                >
                <ArrowRight size={24} />
                </button>
            </div>
         )}
        <h1 className="text-3xl font-bold text-white mb-2">
            {currentView === 'list' ? 'معرض الصور والفيديو' : selectedAlbum?.title}
        </h1>
        <p className="text-primary-100 text-lg">
             {currentView === 'list' ? 'إدارة الألبومات والمحتوى المرئي' : `${selectedAlbum?.items.length || 0} عناصر`}
        </p>
        
        <div className="mt-4 md:mt-0 md:absolute md:top-1/2 md:left-8 md:transform md:-translate-y-1/2">
             {currentView === 'list' ? (
                <button 
                    onClick={() => setIsAlbumModalOpen(true)}
                    className="flex items-center gap-2 bg-white text-primary-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-bold shadow-sm"
                >
                    <Plus size={20} />
                    <span>ألبوم جديد</span>
                </button>
                ) : (
                <button 
                    onClick={() => setIsMediaModalOpen(true)}
                    className="flex items-center gap-2 bg-white text-primary-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-bold shadow-sm"
                >
                    <Plus size={20} />
                    <span>إضافة وسائط</span>
                </button>
             )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : (
      <>
        {/* Album Grid View */}
        {currentView === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map(album => (
                <div 
                key={album.id} 
                onClick={() => openAlbum(album)}
                className="group cursor-pointer bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                >
                <div className="relative h-48 overflow-hidden">
                    <img 
                    src={album.coverUrl} 
                    alt={album.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all"></div>
                </div>
                <div className="p-4 flex justify-between items-center">
                    <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{album.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                        <FolderOpen size={16} />
                        {album.items.length} عناصر
                    </p>
                    </div>
                    <button 
                    onClick={(e) => handleDeleteAlbum(album.id, e)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="حذف الألبوم"
                    >
                    <Trash2 size={20} />
                    </button>
                </div>
                </div>
            ))}
            {albums.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400">
                    <FolderOpen size={48} className="mx-auto mb-3 opacity-50" />
                    <p>لا توجد ألبومات. ابدأ بإنشاء ألبوم جديد.</p>
                </div>
            )}
            </div>
        )}

        {/* Media Grid View */}
        {currentView === 'detail' && selectedAlbum && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedAlbum.items.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
                <p>لا يوجد صور في هذا الألبوم</p>
                </div>
            )}
            {selectedAlbum.items.map(item => (
                <div key={item.id} className="relative group rounded-lg overflow-hidden h-48 bg-gray-100">
                {item.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white relative">
                        <video src={item.url} className="w-full h-full object-cover opacity-60"></video>
                        <Play size={32} className="relative z-10" />
                        <span className="absolute bottom-2 right-2 text-xs bg-black bg-opacity-70 px-2 py-1 rounded flex items-center gap-1">
                            <Video size={10} /> فيديو
                        </span>
                    </div>
                ) : (
                    <img src={item.url} alt={item.description} className="w-full h-full object-cover" />
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button 
                    onClick={() => handleDeleteMedia(item.id)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transform scale-0 group-hover:scale-100 transition-transform"
                    >
                    <Trash2 size={20} />
                    </button>
                </div>
                {item.description && (
                     <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity truncate">
                        {item.description}
                    </div>
                )}
                </div>
            ))}
            </div>
        )}
      </>
      )}

      {/* Create Album Modal */}
      {isAlbumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">ألبوم جديد</h2>
              <button onClick={() => setIsAlbumModalOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الألبوم</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                  value={albumForm.title}
                  onChange={e => setAlbumForm({...albumForm, title: e.target.value})}
                />
              </div>
              
              <ImageUploader 
                label="غلاف الألبوم"
                currentImage={albumForm.coverUrl}
                onImageSelect={(url) => setAlbumForm({...albumForm, coverUrl: url})}
              />

              <button disabled={isSaving} type="submit" className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 mt-2">
                {isSaving ? 'جاري الإنشاء...' : 'إنشاء الألبوم'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Media Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">إضافة وسائط (صور وفيديو)</h2>
              <button onClick={() => setIsMediaModalOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleAddMedia} className="space-y-4">
              
              <MultiMediaUploader 
                onFilesChange={(files) => setNewMediaFiles(files)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">وصف مشترك (اختياري)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                  value={commonDescription}
                  onChange={e => setCommonDescription(e.target.value)}
                  placeholder="سيتم تطبيق هذا الوصف على جميع الملفات المختارة"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
                <p>ملاحظة: يمكنك رفع ملفات JPG, PNG, WEBP, MP4.</p>
                <p>عدد الملفات المختارة: <strong>{newMediaFiles.length}</strong></p>
              </div>

              <button disabled={isSaving || newMediaFiles.length === 0} type="submit" className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSaving ? 'جاري الرفع والحفظ...' : 'إضافة الملفات'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManager;