// src/pages/NotificationSettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../api/user';
import toast from 'react-hot-toast';
import { 
  BellIcon, 
  EnvelopeIcon, 
  DevicePhoneMobileIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface NotificationPreferences {
  // Email notifications
  notify_appointment_confirmation_email: boolean;
  notify_appointment_cancellation_email: boolean;
  notify_appointment_reminder_email: boolean;
  notify_prescription_update_email: boolean;
  notify_order_update_email: boolean;
  notify_general_updates_email: boolean;
  notify_refill_reminder_email: boolean;
  
  // SMS notifications
  notify_appointment_reminder_sms: boolean;
  
  // Push notifications
  notify_appointment_reminder_push: boolean;
}

const NotificationSettingsPage: React.FC = () => {
  const { user, fetchUserProfile, accessToken } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    notify_appointment_confirmation_email: true,
    notify_appointment_cancellation_email: true,
    notify_appointment_reminder_email: true,
    notify_prescription_update_email: true,
    notify_order_update_email: true,
    notify_general_updates_email: true,
    notify_refill_reminder_email: true,
    notify_appointment_reminder_sms: false,
    notify_appointment_reminder_push: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load user's current preferences
  useEffect(() => {
    if (user) {
      setPreferences({
        notify_appointment_confirmation_email: user.notify_appointment_confirmation_email ?? true,
        notify_appointment_cancellation_email: user.notify_appointment_cancellation_email ?? true,
        notify_appointment_reminder_email: user.notify_appointment_reminder_email ?? true,
        notify_prescription_update_email: user.notify_prescription_update_email ?? true,
        notify_order_update_email: user.notify_order_update_email ?? true,
        notify_general_updates_email: user.notify_general_updates_email ?? true,
        notify_refill_reminder_email: user.notify_refill_reminder_email ?? true,
        notify_appointment_reminder_sms: user.notify_appointment_reminder_sms ?? false,
        notify_appointment_reminder_push: user.notify_appointment_reminder_push ?? true,
      });
    }
  }, [user]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(preferences);
      if (accessToken) {
        await fetchUserProfile(accessToken);
      }
      toast.success('Notification preferences saved!');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save preferences';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const NotificationToggle: React.FC<{
    label: string;
    description: string;
    enabled: boolean;
    onChange: () => void;
    icon: React.ReactNode;
  }> = ({ label, description, enabled, onChange, icon }) => (
    <div className="flex items-start justify-between p-5 bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start space-x-4 flex-1">
        <div className="mt-1 p-2 bg-cream-50 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-yellow-100 transition-colors">
            {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-black text-lg text-black">{label}</h4>
          <p className="text-sm font-bold text-gray-600 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-black transition-colors duration-200 ease-in-out focus:outline-none ${
          enabled ? 'bg-primary-900' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white border-2 border-black shadow-sm ring-0 transition duration-200 ease-in-out mt-[2px] ml-[2px] ${
            enabled ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-50 pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-primary-900 flex items-center justify-center md:justify-start gap-4 font-display tracking-tight">
            <div className="p-3 bg-yellow-400 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <BellIcon className="h-10 w-10 text-black" />
            </div>
            Notification Settings
          </h1>
          <p className="mt-4 text-xl font-bold text-gray-700 max-w-2xl">
            Choose how you want to receive notifications about appointments, prescriptions, and more.
          </p>
        </div>

        {/* Email Notifications Section */}
        <div className="bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 opacity-50 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-2 bg-green-100 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <EnvelopeIcon className="h-6 w-6 text-green-800" />
                </div>
                <h2 className="text-2xl font-black text-black font-display uppercase tracking-wide">Email Notifications</h2>
            </div>
            <div className="space-y-4">
                <NotificationToggle
                label="Appointment Confirmations"
                description="Get notified when your appointment is confirmed"
                enabled={preferences.notify_appointment_confirmation_email}
                onChange={() => handleToggle('notify_appointment_confirmation_email')}
                icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />}
                />
                <NotificationToggle
                label="Appointment Cancellations"
                description="Get notified when an appointment is cancelled"
                enabled={preferences.notify_appointment_cancellation_email}
                onChange={() => handleToggle('notify_appointment_cancellation_email')}
                icon={<CheckCircleIcon className="h-6 w-6 text-red-600" />}
                />
                <NotificationToggle
                label="Appointment Reminders"
                description="Receive reminders 24 hours and 1 hour before appointments"
                enabled={preferences.notify_appointment_reminder_email}
                onChange={() => handleToggle('notify_appointment_reminder_email')}
                icon={<BellIcon className="h-6 w-6 text-blue-600" />}
                />
                <NotificationToggle
                label="Prescription Updates"
                description="Get notified about new prescriptions and updates"
                enabled={preferences.notify_prescription_update_email}
                onChange={() => handleToggle('notify_prescription_update_email')}
                icon={<CheckCircleIcon className="h-6 w-6 text-purple-600" />}
                />
                <NotificationToggle
                label="Medication Refill Reminders"
                description="Receive reminders when it's time to refill your medications"
                enabled={preferences.notify_refill_reminder_email}
                onChange={() => handleToggle('notify_refill_reminder_email')}
                icon={<BellIcon className="h-6 w-6 text-orange-600" />}
                />
                <NotificationToggle
                label="Order Updates"
                description="Track your medication orders from pharmacies"
                enabled={preferences.notify_order_update_email}
                onChange={() => handleToggle('notify_order_update_email')}
                icon={<CheckCircleIcon className="h-6 w-6 text-indigo-600" />}
                />
                <NotificationToggle
                label="General Updates"
                description="Stay informed about VitaNips features and updates"
                enabled={preferences.notify_general_updates_email}
                onChange={() => handleToggle('notify_general_updates_email')}
                icon={<EnvelopeIcon className="h-6 w-6 text-gray-600" />}
                />
            </div>
          </div>
        </div>

        {/* SMS Notifications Section */}
        <div className="bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full -mr-32 -mt-32 opacity-50 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-2 bg-yellow-100 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <DevicePhoneMobileIcon className="h-6 w-6 text-yellow-800" />
                </div>
                <h2 className="text-2xl font-black text-black font-display uppercase tracking-wide">SMS Notifications</h2>
            </div>
            {user?.phone_number ? (
                <div className="space-y-4">
                <NotificationToggle
                    label="Appointment Reminder SMS"
                    description={`Send text reminders to ${user.phone_number}`}
                    enabled={preferences.notify_appointment_reminder_sms}
                    onChange={() => handleToggle('notify_appointment_reminder_sms')}
                    icon={<DevicePhoneMobileIcon className="h-6 w-6 text-blue-600" />}
                />
                </div>
            ) : (
                <div className="p-6 bg-yellow-50 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-base font-bold text-yellow-900 flex items-center">
                    <span className="text-2xl mr-2">⚠️</span>
                    Add a phone number to your profile to enable SMS notifications.
                </p>
                </div>
            )}
          </div>
        </div>

        {/* Push Notifications Section */}
        <div className="bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 pointer-events-none"></div>
          <div className="relative z-10">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-2 bg-blue-100 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <BellIcon className="h-6 w-6 text-blue-800" />
                </div>
                <h2 className="text-2xl font-black text-black font-display uppercase tracking-wide">Push Notifications</h2>
            </div>
            <div className="space-y-4">
                <NotificationToggle
                label="Appointment Reminder Push"
                description="Receive push notifications for appointment reminders"
                enabled={preferences.notify_appointment_reminder_push}
                onChange={() => handleToggle('notify_appointment_reminder_push')}
                icon={<BellIcon className="h-6 w-6 text-primary" />}
                />
            </div>
            <div className="mt-6 p-6 bg-blue-50 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-base font-bold text-blue-900 flex items-start">
                    <span className="text-2xl mr-3">ℹ️</span>
                    Push notifications require enabling browser notifications for VitaNips.
                </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className={`fixed bottom-0 left-0 right-0 p-6 bg-white border-t-4 border-black shadow-[0px_-4px_10px_rgba(0,0,0,0.1)] transition-transform duration-300 z-50 ${hasChanges ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <p className="text-lg font-black text-gray-900 hidden sm:block">
              You have unsaved changes
            </p>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3 bg-primary-900 text-white font-black text-lg uppercase tracking-wide border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"></span>
                    Saving...
                  </>
              ) : (
                  'Save Preferences'
              )}
            </button>
          </div>
        </div>
        
        {/* Spacer for fixed bottom bar */}
        <div className="h-20"></div>

      </div>
    </div>
  );
};

export default NotificationSettingsPage;
