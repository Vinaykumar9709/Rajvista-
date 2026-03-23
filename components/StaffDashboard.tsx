import React, { useState } from 'react';
import { User } from '../types';
import { ClipboardList, Bell, CheckCircle } from 'lucide-react';

interface Props {
  user: User;
}

const StaffDashboard: React.FC<Props> = ({ user }) => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Room 304 - Clean Up', priority: 'High', status: 'Pending' },
    { id: 2, title: 'Lobby - Flower Arrangement', priority: 'Medium', status: 'Pending' },
    { id: 3, title: 'Room 501 - Room Service Delivery', priority: 'High', status: 'Completed' },
  ]);

  const handleMarkDone = (taskId: number) => {
      setTasks(prevTasks => prevTasks.map(t => 
          t.id === taskId ? { ...t, status: 'Completed' } : t
      ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-2xl font-serif font-bold text-amber-900">Staff Portal</h2>
            <p className="text-amber-800/80 font-serif">Hello, {user.name}. Here are your tasks for today.</p>
         </div>
         <div className="bg-white p-2 rounded-full shadow-sm border border-amber-200 relative">
            <Bell className="w-5 h-5 text-amber-700" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white"></span>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Tasks Card */}
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
             <div className="px-6 py-4 border-b border-amber-100 flex justify-between items-center bg-amber-50/50">
                 <h3 className="font-bold text-amber-900 flex items-center gap-2 font-serif">
                    <ClipboardList className="w-5 h-5 text-amber-600" />
                    Current Assignments
                 </h3>
                 <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-1 rounded border border-amber-200">
                    {tasks.filter(t => t.status === 'Pending').length} Pending
                 </span>
             </div>
             <div className="divide-y divide-amber-100">
                {tasks.map(task => (
                    <div key={task.id} className="p-4 hover:bg-amber-50 flex items-center justify-between group cursor-pointer transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-600' : 'bg-amber-500'}`}></div>
                            <div>
                                <h4 className={`font-medium text-amber-900 font-serif ${task.status === 'Completed' ? 'line-through text-amber-400' : ''}`}>
                                    {task.title}
                                </h4>
                                <p className="text-xs text-amber-600/70">Assigned 2 hours ago</p>
                            </div>
                        </div>
                        {task.status === 'Completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                            <button 
                                onClick={() => handleMarkDone(task.id)}
                                className="opacity-0 group-hover:opacity-100 text-xs bg-[#451a03] text-amber-50 px-3 py-1.5 rounded transition-opacity font-serif hover:bg-[#5e2304]"
                            >
                                Mark Done
                            </button>
                        )}
                    </div>
                ))}
             </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
             <div className="bg-gradient-to-br from-[#451a03] to-[#78350f] rounded-xl p-6 text-amber-50 shadow-lg border border-amber-900">
                <h3 className="font-bold text-lg mb-2 font-serif text-amber-100">Shift Overview</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-white/20 pb-2">
                        <span className="opacity-80">Start Time</span>
                        <span className="font-mono text-amber-200">08:00 AM</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/20 pb-2">
                        <span className="opacity-80">End Time</span>
                        <span className="font-mono text-amber-200">04:00 PM</span>
                    </div>
                    <div className="pt-2">
                        <button className="w-full bg-[#fffbf0] text-[#451a03] font-bold py-2 rounded-lg hover:bg-white transition-colors font-serif shadow-md">
                            Clock Out
                        </button>
                    </div>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default StaffDashboard;