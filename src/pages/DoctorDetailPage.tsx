import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    ArrowLeftIcon, 
    StarIcon, 
    CheckBadgeIcon, 
    LanguageIcon, 
    AcademicCapIcon, 
    UserPlusIcon,
    MapPinIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ChatBubbleLeftRightIcon,
    ShareIcon,
    HeartIcon
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';

import { getDoctorById, getDoctorReviews, getDoctorAvailability, PostReviewPayload, postDoctorReview } from '../api/doctors';
import { Doctor, DoctorReview, DoctorAvailability } from '../types/doctors';
import { Appointment } from '../types/appointments';
import { PaginatedResponse } from '../types/common';
import toast from 'react-hot-toast';

import ReviewCard from '../features/doctors/components/ReviewCard';
import AvailabilityDisplay from '../features/doctors/components/AvailabilityDisplay';
import AppointmentBookingForm from '../features/appointments/components/AppointmentBookingForm';
import Modal from '../components/common/Modal';
import SmartImage from '../components/common/SmartImage';
import { useAuth } from '../contexts/AuthContext';

import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';

// --- Sub-Components ---

interface ReviewFormProps {
  doctorId: number;
  onSubmitSuccess: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ doctorId, onSubmitSuccess }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setFormError("Please select a rating."); return; }
    setIsSubmitting(true); setFormError(null);
    const payload: PostReviewPayload = { rating, comment };
    try {
      await postDoctorReview(doctorId, payload);
      toast.success("Review submitted successfully!");
      setRating(0); setComment('');
      onSubmitSuccess(); // This should re-fetch reviews
    } catch (err) {
      const apiError = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: unknown } }).response?.data 
        : undefined;
      let errMsg = "Failed to submit review.";
      if (apiError && typeof apiError === 'object') {
        if ('non_field_errors' in apiError && Array.isArray(apiError.non_field_errors)) {
          errMsg = apiError.non_field_errors.join(' ');
        } else if ('rating' in apiError && Array.isArray(apiError.rating)) {
          errMsg = `Rating: ${apiError.rating.join(' ')}`;
        } else if ('detail' in apiError && typeof apiError.detail === 'string') {
          errMsg = apiError.detail;
        }
      }
      setFormError(errMsg);
      toast.error(errMsg);
    } finally { setIsSubmitting(false); }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border-2 border-primary-900/10 mt-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>
      
      <h4 className="text-2xl font-black text-primary-900 mb-6 font-display">Write a Review</h4>
      {formError && <ErrorMessage message={formError} />}
      
      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Your Rating</label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button type="button" key={star} onClick={() => setRating(star)}
              className={`p-1 transition-transform hover:scale-110 focus:outline-none ${rating >= star ? 'text-accent' : 'text-gray-200 hover:text-accent/50'}`}>
              <StarIcon className="h-10 w-10" />
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <label htmlFor="comment" className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Your Experience</label>
        <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)}
          rows={4} 
          className="w-full rounded-2xl border-2 border-primary-900/10 bg-cream-50 shadow-inner focus:border-primary-900 focus:ring-0 resize-none p-5 text-lg font-medium text-primary-900 placeholder:text-gray-400/70" 
          placeholder="Share your experience with this doctor..." 
        />
      </div>
      
      <button 
        type="submit" 
        className="px-10 py-4 bg-primary-900 text-white font-black text-lg rounded-2xl hover:bg-accent transition-all disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]" 
        disabled={isSubmitting || rating === 0}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

interface FollowUpLocationState {
  isFollowUp?: boolean;
  originalAppointmentId?: number;
  prefillReason?: string;
  openBookingModalDirectly?: boolean;
}

// --- Main Page Component ---

const DoctorDetailPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const followUpState = location.state as FollowUpLocationState | null;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [reviews, setReviews] = useState<DoctorReview[]>([]);
  const [reviewsNextPageUrl, setReviewsNextPageUrl] = useState<string | null>(null);
  const [reviewsTotalCount, setReviewsTotalCount] = useState<number>(0);
  const [isLoadingMoreReviews, setIsLoadingMoreReviews] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(true);
  const [_errorReviews, setErrorReviews] = useState<string | null>(null);

  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  
  // Add simple favorite functionality placeholder
  const [isFavorite, setIsFavorite] = useState(false);

  const placeholderImage = '/images/doctor-placeholder.svg';
  const followUpHandledRef = useRef(false);

  const loadDoctorData = useCallback(async (refreshAll: boolean = false, refreshJustReviews: boolean = false) => {
    if (!doctorId) { setError("Doctor ID not found."); setIsLoading(false); return; }
    const id = parseInt(doctorId, 10);
    if (isNaN(id)) { setError("Invalid Doctor ID."); setIsLoading(false); return; }

    if (refreshAll) {
      setIsLoading(true);
      setDoctor(null);
      setAvailability([]);
    }
    if (refreshAll || refreshJustReviews) {
      setIsLoadingReviews(true);
      setReviews([]);
      setReviewsNextPageUrl(null);
      setReviewsTotalCount(0);
    }
    setError(null); setErrorReviews(null);

    try {
      const promises = [];
      if (refreshAll || !doctor) promises.push(getDoctorById(id));
      else promises.push(Promise.resolve(doctor));

      if (refreshAll || refreshJustReviews || reviews.length === 0) promises.push(getDoctorReviews(id));
      else promises.push(Promise.resolve({ results: reviews, next: reviewsNextPageUrl, previous: null, count: reviewsTotalCount } as PaginatedResponse<DoctorReview>));

      if (refreshAll || availability.length === 0) promises.push(getDoctorAvailability(id));
      else promises.push(Promise.resolve({ results: availability, next: null, previous: null, count: availability.length } as PaginatedResponse<DoctorAvailability>));

      const [docResult, reviewResult, availResult] = await Promise.allSettled(promises);

      if (docResult.status === 'fulfilled') setDoctor(docResult.value as Doctor);
      else if (refreshAll || !doctor) throw docResult.reason;

      if (reviewResult.status === 'fulfilled') {
        const reviewResponse = reviewResult.value as PaginatedResponse<DoctorReview>;
        setReviews(reviewResponse.results);
        setReviewsNextPageUrl(reviewResponse.next);
        setReviewsTotalCount(reviewResponse.count);
      } else if (refreshAll || refreshJustReviews) {
        setErrorReviews((reviewResult.reason as Error)?.message || "Failed to load reviews.");
      }

      if (availResult.status === 'fulfilled') {
        const availResponse = availResult.value as PaginatedResponse<DoctorAvailability>;
        setAvailability(availResponse.results);
      } else if (refreshAll || availability.length === 0) {
        if (!error) setError((availResult.reason as Error)?.message || "Failed to load availability.");
      }

    } catch (err) {
      console.error("Error loading doctor data:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsLoadingReviews(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadDoctorData(true);
  }, [loadDoctorData]);

  useEffect(() => {
    if (
      followUpState?.openBookingModalDirectly &&
      doctor &&
      availability.length > 0 &&
      !showBookingModal &&
      !followUpHandledRef.current
    ) {
      setShowBookingModal(true);
      followUpHandledRef.current = true;
      navigate(location.pathname, { replace: true });
    }
  }, [followUpState, doctor, availability, showBookingModal, navigate, location.pathname]);

  const loadMoreReviews = async () => {
    if (!reviewsNextPageUrl || isLoadingMoreReviews || !doctorId) return;
    setIsLoadingMoreReviews(true);
    setErrorReviews(null);
    try {
      const response = await getDoctorReviews(parseInt(doctorId, 10), reviewsNextPageUrl);
      if (response && Array.isArray(response.results)) {
        setReviews(prevReviews => [...prevReviews, ...response.results]);
        setReviewsNextPageUrl(response.next);
      } else {
        setReviewsNextPageUrl(null);
      }
    } catch (err) {
      setErrorReviews("Failed to load more reviews.");
    } finally {
      setIsLoadingMoreReviews(false);
    }
  };

  const handleReviewSubmitSuccess = () => {
    loadDoctorData(false, true);
  };

  const handleBookingSuccess = (newAppointment: Appointment) => {
    setShowBookingModal(false);
    toast.success(`Appointment booked successfully!`);
    navigate(`/appointments/${newAppointment.id}`);
  };

  if (isLoading && !doctor) return <div className="flex justify-center items-center min-h-screen bg-cream-50"><Spinner size="lg" /></div>;
  if (error && !doctor) return <div className="min-h-screen flex flex-col items-center justify-center bg-cream-50"><ErrorMessage message={error} /><Link to="/doctors" className="mt-4 px-8 py-3 bg-primary-900 text-white font-bold rounded-xl">Back to Doctors</Link></div>;
  if (!doctor) return <div className="min-h-screen flex flex-col items-center justify-center bg-cream-50"><p className="text-primary-900 font-bold text-xl">Doctor not found.</p><Link to="/doctors" className="mt-4 px-8 py-3 bg-primary-900 text-white font-bold rounded-xl">Back to Doctors</Link></div>;

  const hasUserReviewed = reviews.some(review => review.user === user?.id);

  const mainContent = (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb / Back */}
        <div className="mb-8">
            <Link to="/doctors" className="inline-flex items-center text-gray-500 hover:text-primary-900 transition-colors group font-bold">
                <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to List
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Profile & Info (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* Hero / Profile Card */}
                <div className="bg-primary-900 rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-10 -mb-10"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start gap-8 md:gap-12">
                        {/* Image Frame */}
                        <div className="relative group shrink-0 mx-auto md:mx-0">
                            <div className="absolute inset-0 bg-accent rounded-[2rem] rotate-6 group-hover:rotate-3 transition-transform duration-300"></div>
                            <div className="relative h-56 w-56 md:h-64 md:w-64 bg-white p-2 rounded-[2rem] shadow-xl rotate-[-3deg] group-hover:rotate-0 transition-transform duration-300">
                                <SmartImage
                                    src={doctor.profile_picture || placeholderImage}
                                    placeholderSrc={placeholderImage}
                                    alt={doctor.full_name}
                                    className="h-full w-full object-cover rounded-[1.8rem] border-2 border-gray-100"
                                />
                                {doctor.is_verified && (
                                    <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-2 shadow-lg border-2 border-primary-900/5">
                                        <CheckBadgeIcon className="h-10 w-10 text-blue-500" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 text-center md:text-left text-white">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                {doctor.specialties.map((spec, idx) => (
                                    <span key={idx} className="px-4 py-1.5 bg-white/10 text-white font-bold rounded-xl text-sm border border-white/20 hover:bg-white hover:text-primary-900 transition-colors cursor-default">
                                        {spec.name}
                                    </span>
                                ))}
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-black mb-4 font-display leading-[1.1] tracking-tight">
                                {doctor.full_name}
                            </h1>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-base font-medium text-white/80 mb-8">
                                <div className="flex items-center">
                                    <StarIcon className="h-5 w-5 text-accent mr-2" />
                                    <span className="text-white font-bold mr-1">{doctor.average_rating > 0 ? doctor.average_rating.toFixed(1) : 'New'}</span>
                                    <span className="opacity-60">({reviewsTotalCount} reviews)</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPinIcon className="h-5 w-5 text-white/60 mr-2" />
                                    {doctor.office_address || 'Virtual Consultation'}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <button 
                                    onClick={() => setShowBookingModal(true)}
                                    className="px-8 py-3 bg-white text-primary-900 font-black rounded-xl hover:bg-accent hover:text-white hover:scale-105 transition-all shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] flex items-center"
                                >
                                    <UserPlusIcon className="h-5 w-5 mr-2" />
                                    Book Now
                                </button>
                                <button 
                                    onClick={() => setIsFavorite(!isFavorite)}
                                    className="p-3 rounded-xl bg-white/10 text-white hover:bg-white hover:text-red-500 transition-all border border-white/20"
                                >
                                    {isFavorite ? <HeartIcon className="h-6 w-6 text-red-500" /> : <HeartIconOutline className="h-6 w-6" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="bg-white rounded-[2rem] p-8 md:p-10 border-2 border-primary-900/10 shadow-sm relative overflow-hidden">
                    <h3 className="text-2xl font-black text-primary-900 mb-6 font-display flex items-center">
                        <span className="bg-accent w-8 h-8 rounded-lg mr-3 flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </span>
                        About Dr. {doctor.last_name}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed text-lg font-medium mb-8">
                        {doctor.bio || `Dr. ${doctor.last_name} is a highly skilled specialist with ${doctor.years_of_experience} years of experience in ${doctor.specialties[0]?.name || 'medicine'}. They are dedicated to providing comprehensive and compassionate care to all patients.`}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-cream-50 p-6 rounded-2xl border-2 border-primary-900/5">
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-white rounded-xl shadow-sm mr-3 border border-gray-100">
                                    <AcademicCapIcon className="h-6 w-6 text-primary-900" />
                                </div>
                                <h4 className="font-bold text-gray-900 text-lg">Education</h4>
                            </div>
                            <p className="text-gray-600 font-medium">
                                {doctor.education || 'Medical Degree Verified'}
                            </p>
                            <div className="mt-4 pt-4 border-t-2 border-primary-900/5 flex justify-between items-center">
                                <span className="text-sm text-gray-500 font-bold uppercase tracking-wide">Experience</span>
                                <span className="font-black text-white bg-primary-900 px-3 py-1 rounded-lg">
                                    {doctor.years_of_experience} Years
                                </span>
                            </div>
                        </div>

                        <div className="bg-cream-50 p-6 rounded-2xl border-2 border-primary-900/5">
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-white rounded-xl shadow-sm mr-3 border border-gray-100">
                                    <LanguageIcon className="h-6 w-6 text-primary-900" />
                                </div>
                                <h4 className="font-bold text-gray-900 text-lg">Languages</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {doctor.languages_spoken ? (
                                    doctor.languages_spoken.split(',').map((lang, idx) => (
                                        <span key={idx} className="px-4 py-1.5 bg-white border-2 border-primary-900/5 rounded-xl text-sm font-bold text-gray-700">
                                            {lang.trim()}
                                        </span>
                                    ))
                                ) : (
                                    <span className="px-4 py-1.5 bg-white border-2 border-primary-900/5 rounded-xl text-sm font-bold text-gray-700">English</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-white rounded-[2rem] shadow-sm border-2 border-primary-900/10 p-8 md:p-10">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                        <h3 className="text-2xl font-black text-primary-900 font-display flex items-center">
                            <span className="bg-accent w-8 h-8 rounded-lg mr-3 flex items-center justify-center text-white">
                                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                            </span>
                            Patient Reviews
                        </h3>
                        {reviewsTotalCount > 0 && (
                            <span className="bg-primary-900 text-white text-sm font-bold px-4 py-1.5 rounded-xl shadow-md transform rotate-2">
                                {reviewsTotalCount} Verified
                            </span>
                        )}
                    </div>

                    {isLoadingReviews && !reviews.length ? (
                        <div className="flex justify-center py-12"><Spinner size="md" /></div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.length > 0 ? (
                                reviews.map(review => <ReviewCard key={review.id} review={review} />)
                            ) : (
                                <div className="text-center py-16 bg-cream-50 rounded-[2rem] border-2 border-dashed border-gray-300/50">
                                    <StarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-primary-900 font-bold text-lg">No reviews yet</p>
                                    <p className="text-gray-500 mt-1 font-medium">Be the first to share your experience with Dr. {doctor.last_name}</p>
                                </div>
                            )}

                            {reviewsNextPageUrl && (
                                <div className="text-center pt-8 border-t-2 border-primary-900/5">
                                    <button 
                                        onClick={loadMoreReviews} 
                                        disabled={isLoadingMoreReviews}
                                        className="text-primary-900 hover:text-white font-bold text-sm px-8 py-3 bg-white border-2 border-primary-900 hover:bg-primary-900 rounded-xl transition-all"
                                    >
                                        {isLoadingMoreReviews ? 'Loading...' : 'Read More Reviews'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {isAuthenticated && !hasUserReviewed && (
                        <ReviewForm doctorId={doctor.id} onSubmitSuccess={handleReviewSubmitSuccess} />
                    )}
                </div>
            </div>

            {/* Right Column: Sticky Availability & Booking (4 cols) */}
            <div className="lg:col-span-4">
                <div className="sticky top-8 space-y-6">
                    {/* Booking Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border-4 border-white ring-1 ring-gray-100 p-6 overflow-hidden relative">
                        {/* Header */}
                        <div className="text-center mb-6">
                             <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-1">Consultation Fee</p>
                             <div className="inline-block bg-cream-100 px-6 py-2 rounded-2xl border-2 border-primary-900/5">
                                <span className="text-2xl font-black text-primary-900">
                                    {doctor.consultation_fee ? `₦${parseFloat(doctor.consultation_fee).toLocaleString()}` : 'Contact'}
                                </span>
                             </div>
                        </div>

                        <div className="bg-primary-900 rounded-[2rem] p-6 text-white relative overflow-hidden mb-6">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            
                            <h3 className="font-bold text-lg mb-6 flex items-center relative z-10 border-b border-white/10 pb-4">
                                <ClockIcon className="h-5 w-5 mr-2 text-accent" />
                                Weekly Schedule
                            </h3>
                            
                            <div className="relative z-10 [&_*]:text-white/90">
                                <AvailabilityDisplay availability={availability} />
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <button 
                                onClick={() => setShowBookingModal(true)}
                                className="w-full py-4 bg-accent text-white font-black text-lg rounded-2xl hover:bg-accent-hover shadow-lg hover:shadow-accent/40 hover:-translate-y-1 transition-all flex items-center justify-center uppercase tracking-wider"
                            >
                                Book Appointment
                            </button>
                            
                            {!isAuthenticated ? (
                                <p className="text-xs text-center text-gray-500 font-bold">
                                    Existing patient? <Link to="/login" className="text-primary-900 underline decoration-2">Login</Link> to book faster.
                                </p>
                            ) : (
                                <button className="w-full py-3 bg-white text-primary-900 font-bold border-2 border-primary-900/10 rounded-2xl hover:border-primary-900 transition-colors flex items-center justify-center">
                                    <ShareIcon className="h-5 w-5 mr-2 text-gray-400" />
                                    Share Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50/50 p-4 rounded-3xl text-center border-2 border-transparent hover:border-blue-100 transition-colors">
                            <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm text-blue-500">
                                <CheckBadgeIcon className="h-6 w-6" />
                            </div>
                            <p className="text-xs font-black text-blue-900 uppercase">Verified</p>
                        </div>
                        <div className="bg-green-50/50 p-4 rounded-3xl text-center border-2 border-transparent hover:border-green-100 transition-colors">
                            <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm text-green-500">
                                <CurrencyDollarIcon className="h-6 w-6" />
                            </div>
                            <p className="text-xs font-black text-green-900 uppercase">Secure</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-cream-50 pb-12 font-sans">
      {/* Navbar Placeholder - Handled globally but ensuring padding */}
      <div className="h-4"></div>

      {mainContent}
      
      <Modal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} title={`Book with ${doctor.full_name}`}>
        <AppointmentBookingForm
          doctorId={doctor.id}
          doctorName={doctor.full_name}
          doctorConsultationFee={doctor.consultation_fee ? parseFloat(doctor.consultation_fee) : null}
          availability={availability}
          onBookingSuccess={handleBookingSuccess}
          onCancel={() => setShowBookingModal(false)}
          isFollowUp={followUpState?.isFollowUp}
          prefillReason={followUpState?.prefillReason}
        />
      </Modal>
    </div>
  );
};

export default DoctorDetailPage;