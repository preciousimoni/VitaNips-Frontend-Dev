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
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-8">
      <h4 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h4>
      {formError && <ErrorMessage message={formError} />}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">Your Rating</label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button type="button" key={star} onClick={() => setRating(star)}
              className={`p-1 transition-transform hover:scale-110 focus:outline-none ${rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}>
              <StarIcon className="h-8 w-8" />
            </button>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <label htmlFor="comment" className="block text-sm font-bold text-gray-700 mb-2">Your Experience</label>
        <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)}
          rows={4} 
          className="w-full rounded-xl border-gray-200 bg-white shadow-sm focus:border-primary focus:ring-primary resize-none p-4" 
          placeholder="Share your experience with this doctor..." 
        />
      </div>
      <button 
        type="submit" 
        className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5" 
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
  // const [errorReviews, setErrorReviews] = useState<string | null>(null);

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

  if (isLoading && !doctor) return <div className="flex justify-center items-center min-h-screen bg-gray-50"><Spinner size="lg" /></div>;
  if (error && !doctor) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50"><ErrorMessage message={error} /><Link to="/doctors" className="mt-4 btn-primary">Back to Doctors</Link></div>;
  if (!doctor) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50"><p className="text-muted">Doctor not found.</p><Link to="/doctors" className="mt-4 btn-primary">Back to Doctors</Link></div>;

  const hasUserReviewed = reviews.some(review => review.user === user?.id);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header / Hero */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link to="/doctors" className="flex items-center text-gray-500 hover:text-primary transition-colors group px-3 py-2 rounded-lg hover:bg-gray-50">
                <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold">Back to List</span>
            </Link>
            <div className="flex items-center space-x-6">
                <div className="hidden sm:block text-right">
                    <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Consultation Fee</span>
                    <span className="block text-lg font-bold text-gray-900">
                        {doctor.consultation_fee ? `₦${parseFloat(doctor.consultation_fee).toLocaleString()}` : 'Contact'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsFavorite(!isFavorite)}
                        className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                        {isFavorite ? <HeartIcon className="h-6 w-6 text-red-500" /> : <HeartIconOutline className="h-6 w-6" />}
                    </button>
                    <button 
                        onClick={() => setShowBookingModal(true)}
                        className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center"
                    >
                        <UserPlusIcon className="h-5 w-5 mr-2" />
                        Book Appointment
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Info Card */}
            <div className="lg:col-span-2 space-y-8">
                {/* Doctor Profile Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                    {/* Cover Banner */}
                    <div className="h-48 bg-gradient-to-r from-primary-dark to-primary relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>
                    </div>
                    
                    <div className="px-8 pb-10 relative">
                        <div className="flex flex-col sm:flex-row items-end -mt-16 mb-8 gap-6">
                            <div className="relative">
                                <div className="h-40 w-40 rounded-3xl border-4 border-white shadow-xl bg-white overflow-hidden">
                                    <SmartImage
                                        src={doctor.profile_picture || placeholderImage}
                                        placeholderSrc={placeholderImage}
                                        alt={doctor.full_name}
                                        width={160}
                                        height={160}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                {doctor.is_verified && (
                                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md" title="Verified Specialist">
                                        <CheckBadgeIcon className="h-8 w-8 text-blue-500" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 pb-2 text-center sm:text-left">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">{doctor.full_name}</h1>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
                                    {doctor.specialties.map((spec, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-full text-sm">
                                            {spec.name}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-sm font-medium text-gray-500">
                                    <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                                        <StarIcon className="h-5 w-5 text-yellow-400 mr-1.5" />
                                        <span className="text-gray-900 font-bold mr-1">{doctor.average_rating > 0 ? doctor.average_rating.toFixed(1) : 'N/A'}</span>
                                        <span className="text-gray-400 font-normal">({reviewsTotalCount} reviews)</span>
                                    </div>
                                    <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-1.5" />
                                        {doctor.office_address || 'Virtual Consultation'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    About Dr. {doctor.last_name}
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {doctor.bio || `Dr. ${doctor.last_name} is a highly skilled specialist with ${doctor.years_of_experience} years of experience in ${doctor.specialties[0]?.name || 'medicine'}. They are dedicated to providing comprehensive and compassionate care to all patients.`}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <div className="flex items-center mb-4">
                                        <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                                            <AcademicCapIcon className="h-6 w-6 text-primary" />
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-lg">Education</h4>
                                    </div>
                                    <p className="text-gray-600 whitespace-pre-line">
                                        {doctor.education || 'Medical Degree Verified'}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                        <span className="text-sm text-gray-500 font-medium">Experience</span>
                                        <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                                            {doctor.years_of_experience} Years
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <div className="flex items-center mb-4">
                                        <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                                            <LanguageIcon className="h-6 w-6 text-primary" />
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-lg">Languages</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {doctor.languages_spoken ? (
                                            doctor.languages_spoken.split(',').map((lang, idx) => (
                                                <span key={idx} className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
                                                    {lang.trim()}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 shadow-sm">English</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                            <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary mr-3" />
                            Patient Reviews
                        </h3>
                        {reviewsTotalCount > 0 && (
                            <span className="bg-gray-100 text-gray-700 text-sm font-bold px-4 py-1.5 rounded-full">
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
                                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <StarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-900 font-bold text-lg">No reviews yet</p>
                                    <p className="text-gray-500 mt-1">Be the first to share your experience with Dr. {doctor.last_name}</p>
                                </div>
                            )}

                            {reviewsNextPageUrl && (
                                <div className="text-center pt-6 border-t border-gray-100">
                                    <button 
                                        onClick={loadMoreReviews} 
                                        disabled={isLoadingMoreReviews}
                                        className="text-primary hover:text-primary-dark font-bold text-sm px-6 py-3 hover:bg-primary/5 rounded-xl transition-colors"
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

            {/* Right Column: Sticky Availability & Booking */}
            <div className="lg:col-span-1">
                <div className="sticky top-40 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl shadow-primary/5 border border-gray-100 p-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>
                        
                        <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center relative z-10">
                            <ClockIcon className="h-6 w-6 text-primary mr-2" />
                            Weekly Schedule
                        </h3>
                        
                        <div className="relative z-10">
                            <AvailabilityDisplay availability={availability} />
                        </div>
                        
                        {availability.length === 0 && !isLoading && (
                            <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl text-center border border-gray-100 mt-4">
                                Specific hours not listed. Please proceed to booking to see exact slots.
                            </p>
                        )}

                        <div className="mt-8 space-y-4 relative z-10">
                            <button 
                                onClick={() => setShowBookingModal(true)}
                                className="w-full py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center"
                            >
                                Book Appointment
                            </button>
                            
                            {!isAuthenticated ? (
                                <p className="text-xs text-center text-gray-500">
                                    Existing patient? <Link to="/login" className="text-primary font-bold hover:underline">Login</Link> to book faster.
                                </p>
                            ) : (
                                <button className="w-full py-3 bg-white text-gray-700 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm">
                                    <ShareIcon className="h-5 w-5 mr-2 text-gray-400" />
                                    Share Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Trust/Safety Badges */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-5 rounded-2xl text-center transition-transform hover:scale-105 duration-300">
                            <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                <CheckBadgeIcon className="h-6 w-6 text-blue-500" />
                            </div>
                            <p className="text-sm font-bold text-blue-900">Verified License</p>
                            <p className="text-[10px] text-blue-700/70 mt-1">Board Certified</p>
                        </div>
                        <div className="bg-green-50 p-5 rounded-2xl text-center transition-transform hover:scale-105 duration-300">
                            <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
                            </div>
                            <p className="text-sm font-bold text-green-900">Secure Payment</p>
                            <p className="text-[10px] text-green-700/70 mt-1">Protected Transactions</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

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