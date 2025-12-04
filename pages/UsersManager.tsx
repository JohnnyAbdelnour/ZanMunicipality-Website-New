
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  X, 
  Shield, 
  User, 
  Check 
} from 'lucide-react';
import { AppUser, AVAILABLE_PERMISSIONS } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const UsersManager: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'editor',
    permissions: [] as string[]
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setUsers(data);
    }
    if (error) console.error(error);
    setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) {
        alert("لا يمكنك حذف حسابك الحالي.");
        return;
    }
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      const { error } = await supabase.from('app_users').delete().eq('id', id);
      if (!error) {
        setUsers(users.filter(u => u.id !== id));
      }
    }
  };

  const handleEdit = (user: AppUser) => {
    setEditingUser(user);
    setFormData({
        username: user.username,
        password: user.password || '',
        full_name: user.full_name,
        role: user.role,
        permissions: user.permissions || []
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({
        username: '',
        password: '',
        full_name: '',
        role: 'editor',
        permissions: []
    });
    setIsModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    if (formData.permissions.includes(permId)) {
        setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== permId) });
    } else {
        setFormData({ ...formData, permissions: [...formData.permissions, permId] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
        username: formData.username,
        password: formData.password, // Plain text for this custom implementation
        full_name: formData.full_name,
        role: formData.role,
        permissions: formData.permissions
    };

    let error;
    if (editingUser) {
        const { error: err } = await supabase.from('app_users').update(payload).eq('id', editingUser.id);
        error = err;
    } else {
        const { error: err } = await supabase.from('app_users').insert([payload]);
        error = err;
    }
    
    setIsSaving(false);
    if (!error) {
        fetchUsers();
        setIsModalOpen(false);
    } else {
        alert('حدث خطأ. ربما اسم المستخدم موجود بالفعل.');
        console.error(error);
    }
  };

  return (
    <div>
      {/* Green Banner */}
      <div className="bg-primary-700 -mx-6 -mt-6 mb-8 p-8 text-center relative shadow-md">
        <h1 className="text-3xl font-bold text-white mb-2">إدارة المستخدمين والصلاحيات</h1>
        <p className="text-primary-100 text-lg">إضافة مستخدمين وتحديد صلاحيات الوصول</p>
        
        <div className="mt-4 md:mt-0 md:absolute md:top-1/2 md:left-8 md:transform md:-translate-y-1/2">
            <button 
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-white text-primary-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-bold shadow-sm"
            >
                <Plus size={20} />
                <span>مستخدم جديد</span>
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
                        <th className="px-6 py-4">الاسم الكامل</th>
                        <th className="px-6 py-4">اسم المستخدم</th>
                        <th className="px-6 py-4">الدور</th>
                        <th className="px-6 py-4">الصلاحيات</th>
                        <th className="px-6 py-4">إجراءات</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {users.map(userItem => (
                        <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                                    {userItem.full_name.charAt(0)}
                                </div>
                                <span className="font-semibold text-gray-800">{userItem.full_name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{userItem.username}</td>
                        <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                userItem.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                                {userItem.role === 'admin' ? 'مدير عام' : 'محرر'}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                                {userItem.role === 'admin' ? (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">كل الصلاحيات</span>
                                ) : (
                                    userItem.permissions?.map(p => {
                                        const label = AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p;
                                        return (
                                            <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                {label}
                                            </span>
                                        );
                                    })
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleEdit(userItem)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="تعديل"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(userItem.id)}
                                    className={`p-1.5 rounded-md transition-colors ${
                                        userItem.id === currentUser?.id ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'
                                    }`}
                                    title="حذف"
                                    disabled={userItem.id === currentUser?.id}
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
        </div>
      )}

       {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                         {editingUser ? 'تعديل المستخدم' : 'مستخدم جديد'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                                value={formData.full_name}
                                onChange={e => setFormData({...formData, full_name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">نوع الحساب</label>
                            <select 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value as any})}
                            >
                                <option value="editor">محرر (صلاحيات محددة)</option>
                                <option value="admin">مدير عام (كل الصلاحيات)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الدخول</label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {formData.role !== 'admin' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">صلاحيات الوصول</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {AVAILABLE_PERMISSIONS.map(perm => (
                                    <div 
                                        key={perm.id}
                                        onClick={() => togglePermission(perm.id)}
                                        className={`cursor-pointer p-3 rounded-lg border flex items-center justify-between transition-all ${
                                            formData.permissions.includes(perm.id) 
                                                ? 'bg-primary-50 border-primary-500 text-primary-800' 
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="text-sm font-medium">{perm.label}</span>
                                        {formData.permissions.includes(perm.id) && (
                                            <Check size={16} className="text-primary-600" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
                             <span>{isSaving ? 'جاري الحفظ...' : 'حفظ المستخدم'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;
