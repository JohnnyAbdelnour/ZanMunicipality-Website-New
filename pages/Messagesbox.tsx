

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Mail, 
  MailOpen,
  Reply,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { Message } from '../types';
import { supabase } from '../lib/supabase';

const Messagesbox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('date', { ascending: false });
    
    if (data) setMessages(data);
    if (error) console.error(error);
    setIsLoading(false);
  };

  const toggleRead = async (id: number, currentStatus: boolean) => {
    // Optimistic update
    setMessages(messages.map(msg => msg.id === id ? { ...msg, read: !currentStatus } : msg));
    if (selectedMessage?.id === id) setSelectedMessage({ ...selectedMessage, read: !currentStatus });

    await supabase.from('messages').update({ read: !currentStatus }).eq('id', id);
  };

  const deleteMessage = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
        const { error } = await supabase.from('messages').delete().eq('id', id);
        if (!error) {
            setMessages(messages.filter(msg => msg.id !== id));
            if (selectedMessage?.id === id) setSelectedMessage(null);
        }
    }
  };

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.read) {
        setMessages(messages.map(m => m.id === msg.id ? { ...m, read: true } : m));
        await supabase.from('messages').update({ read: true }).eq('id', msg.id);
    }
  };

  const handleReply = () => {
    if (!selectedMessage) return;

    const subject = encodeURIComponent(`رد: ${selectedMessage.subject}`);
    const body = encodeURIComponent(`\n\n\n----------------------------------------\nالرسالة الأصلية:\nمن: ${selectedMessage.name}\nالتاريخ: ${selectedMessage.date}\n\n${selectedMessage.message}`);
    
    window.location.href = `mailto:${selectedMessage.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
       {/* Green Banner */}
      <div className="bg-primary-700 -mx-6 -mt-6 mb-4 p-8 text-center relative shadow-md">
        <h1 className="text-3xl font-bold text-white mb-2">صندوق الوارد</h1>
        <p className="text-primary-100 text-lg">رسائل المواطنين والشكاوى</p>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex">
        {/* Message List */}
        <div className={`w-full lg:w-1/3 border-l border-gray-200 flex flex-col ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-200">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="بحث في الرسائل..." 
                        className="w-full pr-10 pl-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary-500" /></div>
                ) : (
                    messages.map(msg => (
                    <div 
                        key={msg.id}
                        onClick={() => handleSelectMessage(msg)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedMessage?.id === msg.id ? 'bg-primary-50 border-r-4 border-r-primary-500' : ''
                        } ${!msg.read ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm ${!msg.read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                {msg.name}
                            </h4>
                            <span className="text-xs text-gray-400">{msg.date}</span>
                        </div>
                        <p className={`text-sm mb-1 ${!msg.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                            {msg.subject}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                            {msg.message}
                        </p>
                    </div>
                )))}
            </div>
        </div>

        {/* Message Detail */}
        <div className={`flex-1 flex-col ${selectedMessage ? 'flex' : 'hidden lg:flex'}`}>
            {selectedMessage ? (
                <>
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setSelectedMessage(null)}
                                className="lg:hidden p-2 text-gray-600 hover:bg-white rounded-md"
                            >
                                <span className="font-bold">عودة</span>
                            </button>
                            <button 
                                onClick={() => deleteMessage(selectedMessage.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                                title="حذف"
                            >
                                <Trash2 size={20} />
                            </button>
                            <button 
                                onClick={() => toggleRead(selectedMessage.id, selectedMessage.read)}
                                className="p-2 text-gray-600 hover:bg-white rounded-md transition-colors"
                                title="تحديد كمقروء/غير مقروء"
                            >
                                {selectedMessage.read ? <Mail size={20} /> : <MailOpen size={20} />}
                            </button>
                        </div>
                        <div className="text-gray-400">
                             <MoreVertical size={20} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedMessage.subject}</h2>
                        
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                {selectedMessage.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{selectedMessage.name}</p>
                                <p className="text-sm text-gray-500">{selectedMessage.email}</p>
                            </div>
                            <div className="mr-auto text-sm text-gray-400">
                                {selectedMessage.date}
                            </div>
                        </div>

                        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {selectedMessage.message}
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <button 
                                onClick={handleReply}
                                className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                <Reply size={18} />
                                <span>رد على الرسالة</span>
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <Mail size={64} className="mb-4 text-gray-300" />
                    <p className="text-lg">اختر رسالة لعرض التفاصيل</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Messagesbox;
