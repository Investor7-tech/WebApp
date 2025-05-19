import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  DollarSign, 
  Settings, 
  LogOut,
  BrainCircuit,
  Bell,
  BookOpen,
  Video,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, profile } = useAuthStore(state => ({
    logout: state.logout,
    profile: state.profile
  }));
  
  const unreadCount = useNotificationStore(state => state.unreadCount);
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Sessions', path: '/dashboard/sessions', icon: Calendar },
    { name: 'Students', path: '/dashboard/students', icon: Users },
    { name: 'Earnings', path: '/dashboard/earnings', icon: DollarSign },
    { name: 'Resources', path: '/dashboard/resources', icon: BookOpen },
    { name: 'Video Call', path: '/dashboard/video-call', icon: Video },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];
  
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        h-full flex flex-col bg-gray-900 text-white w-64 fixed inset-y-0 left-0 z-30
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold">CounselPro</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            {profile?.photoURL ? (
              <img 
                src={profile.photoURL} 
                alt={profile.username}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-medium uppercase">
                {profile?.username?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium">{profile?.username || 'Counselor'}</span>
              <span className="text-xs text-gray-400 truncate max-w-[140px]">{profile?.email}</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
            
            <NavLink
              to="/dashboard/notifications"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <div className="relative">
                <Bell className="mr-3 h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 text-xs flex items-center justify-center bg-red-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              Notifications
            </NavLink>
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;