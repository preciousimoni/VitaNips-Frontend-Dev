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
      <div className="flex items-center justify-center min-h-screen bg-cream-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      {/* Hero Header */}
      <div className="relative bg-primary-900 border-b-4 border-black shadow-[0px_10px_0px_0px_rgba(0,0,0,1)] rounded-b-[3rem] overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FDFBF7_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              <button
                onClick={() => navigate('/doctor/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 text-white font-bold rounded-xl border-2 border-transparent hover:border-white/50 transition-all mb-8 group"
              >
                <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform stroke-[3]" />
                Back to Dashboard
              </button>
              
              <div className="inline-flex items-center px-4 py-1.5 rounded-xl bg-purple-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-black text-xs uppercase tracking-wider mb-6">
                <SparklesIcon className="h-4 w-4 mr-2" />
                SCHEDULE MANAGEMENT
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 font-display tracking-tight leading-tight">
                Manage Your <span className="text-yellow-400">Availability</span>
              </h1>
              <p className="text-lg md:text-xl text-cream-50/90 max-w-2xl font-medium leading-relaxed">
                Set your working hours for each day of the week. Patients will only be able to book appointments during these times.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-red-100 border-4 border-black rounded-[2rem] p-6 flex items-center text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <ExclamationCircleIcon className="h-6 w-6 mr-3 flex-shrink-0 stroke-[2.5]" />
            <p className="font-bold text-lg">{error}</p>
          </motion.div>
        )}

        {/* Weekly Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-12"
        >
          <div className="bg-yellow-400 p-8 border-b-4 border-black flex items-center justify-between">
             <div className="flex items-center gap-4">
              <div className="p-3 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CalendarDaysIcon className="h-8 w-8 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-black font-display">Weekly Schedule</h2>
                <p className="text-black/80 font-bold text-lg">Set your availability for each day</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {DAYS_OF_WEEK.map((day, dayIndex) => {
              const daySlots = getSlotsForDay(day.value);
              const hasSlots = daySlots.length > 0;
              return (
                <motion.div
                  key={day.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * dayIndex }}
                  className={`border-4 rounded-2xl p-6 transition-all ${
                    hasSlots 
                      ? 'border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                    <h3 className={`text-xl font-black flex items-center gap-2 uppercase tracking-wide ${
                        hasSlots ? 'text-black' : 'text-gray-400'
                    }`}>
                      <ClockIcon className={`h-6 w-6 stroke-[3] ${
                          hasSlots ? 'text-black' : 'text-gray-300'
                      }`} />
                      {day.label}
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addSlot(day.value)}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wide border-2 transition-all ${
                          hasSlots 
                            ? 'bg-black text-white border-transparent hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]' 
                            : 'bg-white text-black border-black hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      <PlusIcon className="h-4 w-4 stroke-[3]" />
                      Add Slot
                    </motion.button>
                  </div>

                  {daySlots.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                      <p className="font-bold text-sm">No availability set</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {daySlots.map((slot, slotIndex) => {
                        const globalIndex = availability.findIndex(s => 
                          s.day_of_week === slot.day_of_week && 
                          s.start_time === slot.start_time &&
                          s.end_time === slot.end_time
                        );
                        return (
                          <motion.div
                            key={slotIndex}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col sm:flex-row sm:items-end gap-4 p-4 bg-cream-50 rounded-xl border-2 border-black"
                          >
                            <div className="flex flex-row items-center gap-4 flex-1 w-full">
                              <div className="flex-1">
                                <label className="block text-xs font-black text-black uppercase tracking-wider mb-2">
                                  Start Time
                                </label>
                                <div className="relative">
                                    <select
                                      value={slot.start_time}
                                      onChange={(e) => updateSlot(globalIndex, 'start_time', e.target.value)}
                                      className="w-full px-4 py-3 border-2 border-black rounded-lg font-bold text-black focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow text-base bg-white appearance-none"
                                    >
                                      {TIME_SLOTS.map(time => (
                                        <option key={time.value} value={time.value}>{time.label}</option>
                                      ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black font-bold">▼</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center pt-6 text-black font-black text-xl">→</div>

                              <div className="flex-1">
                                <label className="block text-xs font-black text-black uppercase tracking-wider mb-2">
                                  End Time
                                </label>
                                <div className="relative">
                                    <select
                                      value={slot.end_time}
                                      onChange={(e) => updateSlot(globalIndex, 'end_time', e.target.value)}
                                      className="w-full px-4 py-3 border-2 border-black rounded-lg font-bold text-black focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow text-base bg-white appearance-none"
                                    >
                                      {TIME_SLOTS.map(time => (
                                        <option key={time.value} value={time.value}>{time.label}</option>
                                      ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black font-bold">▼</div>
                                </div>
                              </div>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeSlot(globalIndex)}
                              className="w-full sm:w-auto p-3.5 bg-red-100 text-red-600 rounded-lg border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center"
                              title="Remove time slot"
                            >
                              <TrashIcon className="h-5 w-5 stroke-[2.5]" />
                              <span className="sm:hidden ml-2 font-bold uppercase">Remove</span>
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
          className="flex flex-col sm:flex-row items-center justify-between bg-primary-900 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 gap-6 sm:gap-0"
        >
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-black text-white mb-1 font-display">Ready to publish?</h3>
            <p className="text-white/80 font-bold">Your availability will be updated immediately for all patients.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, x: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveAvailability}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-xl font-black text-lg uppercase tracking-wide border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {saving ? (
              <>
                <Spinner size="sm" />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-6 w-6 stroke-[3]" />
                Save Changes
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ManageAvailabilityPage;

