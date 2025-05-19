import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Session } from '../types/session';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: number;
  data?: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  addSessionBookingNotification: (session: Session) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  initializeTestNotifications: () => void;
}

// Test notifications data
const testNotifications = [
  {
    title: "New Session Request",
    message: "Sarah Johnson requested a counseling session for tomorrow at 2 PM",
    type: "info" as const,
  },
  {
    title: "Payment Received",
    message: "Payment of $120 received from Michael Brown for last week's session",
    type: "success" as const,
  },
  {
    title: "Upcoming Session Reminder",
    message: "You have a session with Emma Thompson in 1 hour",
    type: "warning" as const,
  },
  {
    title: "Session Cancelled",
    message: "David Wilson cancelled their session scheduled for today at 4 PM",
    type: "error" as const,
  },
  {
    title: "Profile Update Required",
    message: "Please update your availability schedule for next week",
    type: "info" as const,
  }
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      
      addNotification: (notification) => {
        const newNotification: Notification = {
          id: uuidv4(),
          ...notification,
          read: false,
          createdAt: Date.now(),
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      addSessionBookingNotification: (session: Session) => {
        const { addNotification } = get();
        const sessionDate = new Date(session.sessionDate);
        const formattedDate = sessionDate.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });

        addNotification({
          title: "New Session Booked",
          message: `${session.userName} has booked a session for ${formattedDate}`,
          type: "success",
          data: { sessionId: session.sessionId }
        });
      },
      
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: state.unreadCount - (state.notifications.find((n) => n.id === id && !n.read) ? 1 : 0),
        }));
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },
      
      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: state.unreadCount - (state.notifications.find((n) => n.id === id && !n.read) ? 1 : 0),
        }));
      },
      
      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      initializeTestNotifications: () => {
        const { addNotification } = get();
        testNotifications.forEach((notification, index) => {
          setTimeout(() => {
            addNotification(notification);
          }, index * 500); // Add notifications with a slight delay between each
        });
      },
    }),
    {
      name: 'notification-storage',
    }
  )
);

// Initialize test notifications when the store is created
useNotificationStore.getState().initializeTestNotifications();