import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationsDropdown from './NotificationsDropdown';
import { useThemeStore } from '../../store/themeStore';

const DashboardLayout: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const unreadCount = useNotificationStore(state => state.unreadCount);
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  
  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 overflow-hidden">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="px-4 lg:px-6 py-4 flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Push notification bell to the right */}
            <div className="flex-1 flex justify-end">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  } focus:outline-none`}
                  aria-label="Toggle notifications"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <NotificationsDropdown onClose={() => setShowNotifications(false)} />
                )}
              </div>
            </div>
          </div>
        </div>
        
        <main className="p-4 lg:p-6 overflow-auto h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;