import React, { useState, useEffect } from 'react';
import { Bell } from "lucide-react";
import  { createClient } from "@/utils/supabase/super-base-client";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Fetch notifications from Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data);
      }
      setLoading(false);
    };

    fetchNotifications();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Mark a notification as read
  const markAsRead = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative bg-white p-2 rounded-full shadow-md">
      {/* Notification Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="w-4 h-4 md:w-5 md:h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] md:text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 transform transition-all duration-300 ease-in-out origin-top-right scale-100 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {loading && <p className="text-gray-500">Loading...</p>}
            {!loading && notifications.length === 0 && (
              <p className="text-gray-500">No notifications</p>
            )}
            <ul className="mt-2 space-y-2 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-3 rounded-md ${
                    notification.is_read ? 'bg-gray-50' : 'bg-blue-50'
                  } hover:bg-gray-100 transition-colors duration-150`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;