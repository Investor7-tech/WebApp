import React, { useState, useEffect, useRef } from 'react';
import { User, Clock, Bell, Globe, Shield, Upload, Moon, Sun, Check } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { TimeSlot, WeekDay, Schedule } from '../../types/counselor';
import Swal from 'sweetalert2';

interface SettingsTabProps {
  children?: React.ReactNode;
  isActive: boolean;
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  children,
  isActive,
  icon,
  title,
  onClick,
}) => {
  return (
    <div
      className={`p-4 cursor-pointer ${
        isActive ? 'bg-white shadow rounded-lg' : 'hover:bg-gray-50 rounded-lg'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div
          className={`p-2 rounded-full ${
            isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {icon}
        </div>
        <div className="ml-3">
          <h3
            className={`text-sm font-medium ${
              isActive ? 'text-gray-900' : 'text-gray-500'
            }`}
          >
            {title}
          </h3>
        </div>
      </div>
      {isActive && <div className="mt-4">{children}</div>}
    </div>
  );
};

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 9; // 9 AM
  const endHour = 22; // 10 PM

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({ time });
    }
  }
  return slots;
};

const defaultSchedule: Schedule = {
  monday: { isWorking: true, availableSlots: [] },
  tuesday: { isWorking: true, availableSlots: [] },
  wednesday: { isWorking: true, availableSlots: [] },
  thursday: { isWorking: true, availableSlots: [] },
  friday: { isWorking: true, availableSlots: [] },
  saturday: { isWorking: false, availableSlots: [] },
  sunday: { isWorking: false, availableSlots: [] }
};

const ALL_TIME_SLOTS = generateTimeSlots();

const Settings: React.FC = () => {
  const { user, profile, updateUserProfile, updateUserPassword, updateUserSettings, updateProfilePicture } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { setCurrency } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [name, setName] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Schedule state with proper typing
  const [schedule, setSchedule] = useState<Schedule>(defaultSchedule);

  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: profile?.settings?.notifications?.email ?? true,
    sms: profile?.settings?.notifications?.sms ?? false,
    sessionReminders: profile?.settings?.notifications?.sessionReminders ?? true,
    paymentNotifications: profile?.settings?.notifications?.paymentNotifications ?? true
  });

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    language: profile?.settings?.language || 'en',
    timezone: profile?.settings?.timezone || 'UTC',
    currency: profile?.settings?.currency || 'USD'
  });

  useEffect(() => {
    if (profile) {
      setName(profile.username);
      setBio(profile.bio);
      // Initialize schedule from profile or use default
      const savedSchedule = profile.settings?.schedule?.workingHours;
      if (savedSchedule) {
        // Create new schedule with saved values
        const updatedSchedule = Object.keys(defaultSchedule).reduce((acc, day) => ({
          ...acc,
          [day]: {
            isWorking: savedSchedule[day as WeekDay]?.isWorking ?? defaultSchedule[day as WeekDay].isWorking,
            availableSlots: savedSchedule[day as WeekDay]?.availableSlots ?? []
          }
        }), {} as Schedule);
        
        setSchedule(updatedSchedule);
      }

      setNotificationPreferences({
        email: profile.settings?.notifications?.email ?? true,
        sms: profile.settings?.notifications?.sms ?? false,
        sessionReminders: profile.settings?.notifications?.sessionReminders ?? true,
        paymentNotifications: profile.settings?.notifications?.paymentNotifications ?? true
      });

      setGeneralSettings({
        language: profile.settings?.language || 'en',
        timezone: profile.settings?.timezone || 'UTC',
        currency: profile.settings?.currency || 'USD'
      });
    }
  }, [profile]);

  const showSuccessAlert = (message: string) => {
    void Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      showConfirmButton: false,
      timer: 1500
    });
  };

  const showErrorAlert = (error: string) => {
    void Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: error
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateUserProfile({
        username: name,
        bio: bio,
      });
      showSuccessAlert('Profile updated successfully!');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      showErrorAlert(error.message);
    }
    setLoading(false);
  };

  const handleSaveGeneral = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateUserSettings({
        language: generalSettings.language,
        timezone: generalSettings.timezone,
        currency: generalSettings.currency
      });
      // Update global currency setting
      setCurrency(generalSettings.currency);
      showSuccessAlert('General settings updated successfully!');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      showErrorAlert(error.message);
    }
    setLoading(false);
  };

  const [meetingLink, setMeetingLink] = useState(profile?.settings?.schedule?.meetingLink || '');

  const handleSaveSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateUserSettings({
        schedule: {
          workingHours: schedule,
          meetingLink: meetingLink
        }
      });
      showSuccessAlert('Schedule and meeting link updated successfully!');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      showErrorAlert(error.message);
    }
    setLoading(false);
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateUserSettings({
        notifications: notificationPreferences
      });
      showSuccessAlert('Notification preferences updated successfully!');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      showErrorAlert(error.message);
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      showErrorAlert("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      await updateUserPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showSuccessAlert('Password updated successfully!');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      showErrorAlert(error.message);
    }
    setLoading(false);
  };

  const handleScheduleChange = (day: WeekDay, type: 'isWorking' | 'timeSlot', value: boolean | string) => {
    setSchedule(prev => {
      if (type === 'isWorking') {
        return {
          ...prev,
          [day]: {
            ...prev[day],
            isWorking: value as boolean,
            availableSlots: [] // Clear available slots when toggling working status
          }
        };
      } else {
        // type === 'timeSlot'
        const timeSlot = { time: value as string };
        const currentSlots = prev[day].availableSlots;
        const isSlotAvailable = currentSlots.some(slot => slot.time === timeSlot.time);
        
        return {
          ...prev,
          [day]: {
            ...prev[day],
            availableSlots: isSlotAvailable
              ? currentSlots.filter(slot => slot.time !== timeSlot.time) // Remove if already selected
              : [...currentSlots, timeSlot].sort((a, b) => a.time.localeCompare(b.time)) // Add and sort by time
          }
        };
      }
    });
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        await updateProfilePicture(file);
        showSuccessAlert('Profile picture updated successfully!');
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        showErrorAlert(error.message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="lg:col-span-1 flex lg:block overflow-x-auto lg:overflow-x-visible -mx-4 lg:mx-0 p-4 lg:p-0 space-x-4 lg:space-x-0 lg:space-y-4">
          <SettingsTab
            isActive={activeTab === 'profile'}
            icon={<User className="h-5 w-5" />}
            title="Profile"
            onClick={() => setActiveTab('profile')}
          />
          <SettingsTab
            isActive={activeTab === 'general'}
            icon={<Globe className="h-5 w-5" />}
            title="General"
            onClick={() => setActiveTab('general')}
          />
          <SettingsTab
            isActive={activeTab === 'schedule'}
            icon={<Clock className="h-5 w-5" />}
            title="Schedule"
            onClick={() => setActiveTab('schedule')}
          />
          <SettingsTab
            isActive={activeTab === 'notifications'}
            icon={<Bell className="h-5 w-5" />}
            title="Notifications"
            onClick={() => setActiveTab('notifications')}
          />
          <SettingsTab
            isActive={activeTab === 'security'}
            icon={<Shield className="h-5 w-5" />}
            title="Security"
            onClick={() => setActiveTab('security')}
          />
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <Card title="General Settings">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Theme</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {isDarkMode ? (
                          <Moon className="h-5 w-5 text-gray-600" />
                        ) : (
                          <Sun className="h-5 w-5 text-amber-500" />
                        )}
                        <span className="font-medium text-gray-700">
                          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          toggleDarkMode();
                          showSuccessAlert(`${isDarkMode ? 'Light' : 'Dark'} mode activated!`);
                        }}
                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        style={{ backgroundColor: isDarkMode ? '#3B82F6' : '#D1D5DB' }}
                        aria-pressed="false"
                      >
                        <span className="sr-only">Toggle theme</span>
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isDarkMode ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Language</h3>
                    <select
                      value={generalSettings.language}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, language: e.target.value }))}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Time Zone</h3>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="UTC">GMT+0 (UTC)</option>
                      <option value="Africa/Accra">GMT+0 (Accra)</option>
                      <option value="Europe/London">GMT+1 (London)</option>
                      <option value="Europe/Paris">GMT+2 (Paris)</option>
                      <option value="Asia/Dubai">GMT+4 (Dubai)</option>
                      <option value="Asia/Bangkok">GMT+7 (Bangkok)</option>
                      <option value="Asia/Hong_Kong">GMT+8 (Hong Kong)</option>
                      <option value="Asia/Tokyo">GMT+9 (Tokyo)</option>
                      <option value="America/New_York">GMT-4 (New York)</option>
                      <option value="America/Chicago">GMT-5 (Chicago)</option>
                      <option value="America/Denver">GMT-6 (Denver)</option>
                      <option value="America/Los_Angeles">GMT-7 (Los Angeles)</option>
                    </select>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Currency</h3>
                    <select
                      value={generalSettings.currency}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, currency: e.target.value }))}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="GHS">Ghana Cedi (₵)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleSaveGeneral}
                    isLoading={loading}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'profile' && (
            <Card title="Profile Information">
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    {profile?.photoURL ? (
                      <div 
                        onClick={() => setShowProfileModal(true)}
                        className="cursor-pointer transition-transform hover:scale-105"
                      >
                        <img 
                          src={profile.photoURL} 
                          alt={profile.username}
                          className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                          <span className="text-white opacity-0 hover:opacity-100">Click to view</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-blue-600 font-medium text-2xl">
                          {profile?.username?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                  />
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Profile Picture
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                  />
                  
                  <Input
                    label="Email"
                    value={user?.email || ''}
                    disabled
                    fullWidth
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                  <div className="flex flex-wrap gap-2">
                    {profile?.specializations?.map((spec) => (
                      <span
                        key={spec.value}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {spec.label}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}
          
          {activeTab === 'schedule' && (
            <Card title="Schedule Settings">
              <div className="space-y-6">
                {/* Meeting Link Section */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Video Meeting Link</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Add your video meeting link (Zoom, Google Meet, etc.). This will be sent to students when they book a session.
                    </p>
                    <input
                      type="url"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://zoom.us/j/your-meeting-id or https://meet.google.com/xxx-xxxx-xxx"
                      className="mt-1 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    />
                  </div>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {Object.entries(schedule).map(([day, hours]) => (
                      <div key={day} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={hours.isWorking}
                              onChange={(e) => handleScheduleChange(day as WeekDay, 'isWorking', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </span>
                          </div>
                          {hours.isWorking && (
                            <span className="text-sm text-gray-500">
                              {hours.availableSlots.length} time slots selected
                            </span>
                          )}
                        </div>
                        
                        {hours.isWorking && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                            {ALL_TIME_SLOTS.map((slot) => (
                              <button
                                key={slot.time}
                                onClick={() => handleScheduleChange(day as WeekDay, 'timeSlot', slot.time)}
                                className={`px-2 py-1 text-xs rounded-md flex items-center justify-center transition-colors ${
                                  hours.availableSlots.some(s => s.time === slot.time)
                                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {slot.time}
                                {hours.availableSlots.some(s => s.time === slot.time) && (
                                  <Check className="ml-1 h-3 w-3" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleSaveSchedule}
                    isLoading={loading}
                  >
                    Save Schedule
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          {activeTab === 'notifications' && (
            <Card title="Notification Preferences">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="email-notifications"
                        type="checkbox"
                        checked={notificationPreferences.email}
                        onChange={(e) => setNotificationPreferences(prev => ({ ...prev, email: e.target.checked }))}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email-notifications" className="font-medium text-gray-700">Email notifications</label>
                      <p className="text-gray-500">Receive email updates about your sessions and students.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="sms-notifications"
                        type="checkbox"
                        checked={notificationPreferences.sms}
                        onChange={(e) => setNotificationPreferences(prev => ({ ...prev, sms: e.target.checked }))}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="sms-notifications" className="font-medium text-gray-700">SMS notifications</label>
                      <p className="text-gray-500">Receive text messages for important updates.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="session-reminders"
                        type="checkbox"
                        checked={notificationPreferences.sessionReminders}
                        onChange={(e) => setNotificationPreferences(prev => ({ ...prev, sessionReminders: e.target.checked }))}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="session-reminders" className="font-medium text-gray-700">Session reminders</label>
                      <p className="text-gray-500">Get reminders before your scheduled sessions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="payment-notifications"
                        type="checkbox"
                        checked={notificationPreferences.paymentNotifications}
                        onChange={(e) => setNotificationPreferences(prev => ({ ...prev, paymentNotifications: e.target.checked }))}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="payment-notifications" className="font-medium text-gray-700">Payment notifications</label>
                      <p className="text-gray-500">Receive updates about payments and transactions.</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6">
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    fullWidth
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleSaveNotifications}
                    isLoading={loading}
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          {activeTab === 'security' && (
            <Card title="Security Settings">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                  <div className="mt-4 space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      fullWidth
                    />
                    
                    <Input
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      fullWidth
                    />
                    
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      fullWidth
                    />
                  </div>
                  
                  <div className="mt-4">
                    <Button
                      variant="primary"
                      onClick={handleChangePassword}
                      isLoading={loading}
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {showProfileModal && profile?.photoURL && (
        <Modal onClose={() => setShowProfileModal(false)}>
          <div className="p-4">
            <img 
              src={profile.photoURL} 
              alt={profile.username}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Settings;