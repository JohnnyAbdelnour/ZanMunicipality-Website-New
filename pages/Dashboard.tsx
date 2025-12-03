

import React from 'react';
import { 
  Users, 
  Newspaper, 
  Megaphone, 
  MessageSquare, 
  ArrowUpRight, 
  Calendar 
} from 'lucide-react';
import { StatCard } from '../types';

const Dashboard: React.FC = () => {
  const stats: StatCard[] = [
    { 
      title: 'إجمالي الزيارات', 
      value: '12,345', 
      icon: <Users size={24} />, 
      trend: '+12% منذ الشهر الماضي',
      color: 'bg-blue-500' 
    },
    { 
      title: 'الأخبار والمشاريع', 
      value: '45', 
      icon: <Newspaper size={24} />, 
      color: 'bg-green-500' 
    },
    { 
      title: 'الاعلانات النشطة', 
      value: '3', 
      icon: <Megaphone size={24} />, 
      color: 'bg-orange-500' 
    },
    { 
      title: 'رسائل جديدة', 
      value: '8', 
      icon: <MessageSquare size={24} />, 
      trend: '5 رسائل غير مقروءة',
      color: 'bg-purple-500' 
    },
  ];

  const recentActivities = [
    { id: 1, action: 'إضافة خبر جديد', target: 'افتتاح حديقة عامة', time: 'منذ ساعتين', user: 'أحمد' },
    { id: 2, action: 'تحديث إعلان', target: 'انقطاع المياه', time: 'منذ 5 ساعات', user: 'سارة' },
    { id: 3, action: 'رد على رسالة', target: 'شكوى بخصوص النظافة', time: 'أمس', user: 'أحمد' },
  ];

  return (
    <div className="space-y-6">
      {/* Green Banner */}
      <div className="bg-primary-700 -mx-6 -mt-6 mb-8 p-8 text-center relative shadow-md">
        <h1 className="text-3xl font-bold text-white mb-2">لوحة القيادة</h1>
        <p className="text-primary-100 text-lg">نظرة عامة على نشاط الموقع</p>
        
        <div className="mt-4 md:mt-0 md:absolute md:top-1/2 md:left-8 md:transform md:-translate-y-1/2">
            <div className="flex items-center gap-2 text-sm text-primary-700 bg-white px-3 py-1.5 rounded-lg border border-transparent shadow-sm font-semibold">
                <Calendar size={16} />
                <span>{new Date().toLocaleDateString('ar-LB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg text-white ${stat.color}`}>
                {stat.icon}
              </div>
              {stat.trend && (
                <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <ArrowUpRight size={12} className="mr-1" />
                  {stat.trend.includes('%') ? stat.trend.split(' ')[0] : 'جديد'}
                </span>
              )}
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
            {stat.trend && !stat.trend.includes('%') && (
                <p className="text-xs text-gray-400 mt-2">{stat.trend}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">آخر النشاطات</h3>
            <button className="text-sm text-primary-600 hover:underline">عرض الكل</button>
          </div>
          <div className="p-6">
            <ul className="space-y-6">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex relative items-start pb-6 last:pb-0 border-l-2 border-gray-100 last:border-0 mr-2 pr-6">
                    <span className="absolute -right-[9px] top-0 w-4 h-4 bg-primary-100 border-2 border-primary-500 rounded-full"></span>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <p className="font-semibold text-gray-800">{activity.action}</p>
                            <span className="text-xs text-gray-400">{activity.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">"{activity.target}"</p>
                        <p className="text-xs text-gray-400 mt-2">بواسطة: {activity.user}</p>
                    </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
           <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">إجراءات سريعة</h3>
          </div>
          <div className="p-6 space-y-3">
            <button className="w-full py-3 px-4 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-2 font-medium border border-primary-200">
                <Newspaper size={18} />
                نشر خبر جديد
            </button>
            <button className="w-full py-3 px-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center gap-2 font-medium border border-orange-200">
                <Megaphone size={18} />
                إضافة إعلان عاجل
            </button>
             <button className="w-full py-3 px-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-medium border border-gray-200">
                <MessageSquare size={18} />
                مراجعة الرسائل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;