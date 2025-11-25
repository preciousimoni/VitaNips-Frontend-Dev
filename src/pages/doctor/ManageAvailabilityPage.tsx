import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ClockIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { getMyAvailability, createAvailabilitySlot, deleteAvailabilitySlot } from '../../api/doctors';
import { DoctorAvailability } from '../../types/doctors';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' }
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour}:00` };
});

interface AvailabilitySlot {
  id?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const ManageAvailabilityPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailability();
  }, []);

  // Safety check: ensure availability is always an array
  useEffect(() => {
    if (!Array.isArray(availability)) {
      console.warn('Availability is not an array, resetting to empty array:', availability);
      setAvailability([]);
    }
  }, [availability]);

  const fetchAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyAvailability();
      // getMyAvailability now always returns an array
      const availabilityArray = Array.isArray(data) ? data : [];
      
      // Ensure we always set an array with proper structure
      setAvailability(availabilityArray.map((slot: DoctorAvailability) => ({
        id: slot.id,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: slot.is_available ?? true
      })));
    } catch (err: unknown) {
      console.error('Failed to fetch availability:', err);
      setError('Failed to load availability. Please try again.');
      toast.error('Failed to load availability');
      setAvailability([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const addSlot = (dayOfWeek: number) => {
    const newSlot: AvailabilitySlot = {
      day_of_week: dayOfWeek,
      start_time: '09:00',
      end_time: '17:00',
      is_available: true
    };
    const currentAvailability = Array.isArray(availability) ? availability : [];
    setAvailability([...currentAvailability, newSlot]);
  };

  const removeSlot = (index: number) => {
    const currentAvailability = Array.isArray(availability) ? availability : [];
    const slot = currentAvailability[index];
    if (slot && slot.id) {
      // Delete from backend
      deleteSlot(slot.id);
    }
    setAvailability(currentAvailability.filter((_, i) => i !== index));
  };

  const deleteSlot = async (id: number) => {
    try {
      await deleteAvailabilitySlot(id);
    } catch (err) {
      console.error('Failed to delete slot:', err);
    }
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: string | number | boolean) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    
    // Validate that end_time is after start_time
    if (field === 'start_time' || field === 'end_time') {
      const slot = updated[index];
      if (slot.start_time && slot.end_time && slot.start_time >= slot.end_time) {
        toast.error('End time must be after start time');
        return;
      }
    }
    
    setAvailability(updated);
  };

  const saveAvailability = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Delete all existing slots first
      const existingSlots = availability.filter(slot => slot.id);
      for (const slot of existingSlots) {
        if (slot.id) {
          await deleteAvailabilitySlot(slot.id);
        }
      }

      // Create new slots
      const newSlots = availability.filter(slot => slot.is_available);
      const promises = newSlots.map(slot =>
        createAvailabilitySlot({
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_available: true
        })
      );

      await Promise.all(promises);
      toast.success('Availability updated successfully!');
      fetchAvailability();
    } catch (err: unknown) {
      console.error('Failed to save availability:', err);
      const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to save availability. Please try again.';
      setError(errorMessage);
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const getSlotsForDay = (dayOfWeek: number) => {
    if (!Array.isArray(availability)) {
      return [];
    }
    return availability.filter(slot => slot.day_of_week === dayOfWeek);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pb-12">
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-primary via-emerald-600 to-teal-600 overflow-hidden mb-8"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1"
            >
              <motion.button
                onClick={() => navigate('/doctor/dashboard')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 font-medium"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Back to Dashboard
              </motion.button>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-sm mb-4"
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                SCHEDULE MANAGEMENT
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                Manage Your{' '}
                <span className="relative inline-block">
                  Availability
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-400/30"
                  ></motion.span>
                </span>
              </h1>
              <p className="text-lg text-white/90 max-w-2xl">
                Set your working hours for each day of the week. Patients will only be able to book appointments during these times.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 48h1440V0s-144 48-360 48S720 0 720 0 576 48 360 48 0 0 0 0v48z" fill="currentColor" className="text-gray-50"/>
          </svg>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center text-red-700 shadow-lg"
          >
            <ExclamationCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        {/* Weekly Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-emerald-600 rounded-xl">
                <CalendarDaysIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Weekly Schedule</h2>
                <p className="text-sm text-gray-500">Set your availability for each day</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {DAYS_OF_WEEK.map((day, dayIndex) => {
              const daySlots = getSlotsForDay(day.value);
              return (
                <motion.div
                  key={day.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * dayIndex }}
                  className="border-2 border-gray-100 rounded-2xl p-6 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <ClockIcon className="h-5 w-5 text-primary" />
                      {day.label}
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addSlot(day.value)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add Time Slot
                    </motion.button>
                  </div>

                  {daySlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <ClockIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">No availability set for {day.label}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {daySlots.map((slot, slotIndex) => {
                        const globalIndex = availability.findIndex(s => 
                          s.day_of_week === slot.day_of_week && 
                          s.start_time === slot.start_time &&
                          s.end_time === slot.end_time
                        );
                        return (
                          <motion.div
                            key={slotIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-emerald-500/5 rounded-xl border border-primary/20"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                  Start Time
                                </label>
                                <select
                                  value={slot.start_time}
                                  onChange={(e) => updateSlot(globalIndex, 'start_time', e.target.value)}
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                  {TIME_SLOTS.map(time => (
                                    <option key={time.value} value={time.value}>{time.label}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                  End Time
                                </label>
                                <select
                                  value={slot.end_time}
                                  onChange={(e) => updateSlot(globalIndex, 'end_time', e.target.value)}
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                  {TIME_SLOTS.map(time => (
                                    <option key={time.value} value={time.value}>{time.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeSlot(globalIndex)}
                              className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                              title="Remove time slot"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between bg-white rounded-3xl shadow-lg border border-gray-100 p-6"
        >
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Save Your Changes</h3>
            <p className="text-sm text-gray-500">Your availability will be updated immediately</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveAvailability}
            disabled={saving}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Spinner size="sm" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                Save Availability
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ManageAvailabilityPage;

