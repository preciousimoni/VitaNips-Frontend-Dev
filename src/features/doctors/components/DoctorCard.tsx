import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon, CheckBadgeIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { Doctor } from '../../../types/doctors';
import SmartImage from '../../../components/common/SmartImage';

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const placeholderImage = '/images/doctor-placeholder.svg';

  return (
    <div className="group bg-white rounded-3xl border-2 border-gray-200 shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-300 flex flex-col overflow-hidden h-full relative">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
        <SmartImage
          src={doctor.profile_picture || placeholderImage}
          placeholderSrc={placeholderImage}
          alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
          eager={false}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        {/* Overlay Badges */}
        <div className="absolute bottom-4 left-4 text-white">
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-bold bg-gradient-to-r from-primary to-teal-600 px-3 py-1.5 rounded-xl backdrop-blur-sm inline-block shadow-lg"
            >
                {doctor.specialties[0]?.name || 'General Practice'}
            </motion.p>
        </div>
        
        <div className="absolute top-4 right-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex items-center bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg text-xs font-bold text-gray-800"
             >
                <StarIcon className="h-4 w-4 text-yellow-400 mr-1.5" />
                {doctor.average_rating > 0 ? doctor.average_rating.toFixed(1) : 'New'}
             </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-6 flex flex-col flex-grow">
        <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors flex items-center mb-1">
                {doctor.full_name}
                {doctor.is_verified && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <CheckBadgeIcon className="h-6 w-6 text-blue-500 ml-2 flex-shrink-0" title="Verified Specialist" />
                    </motion.div>
                )}
            </h3>
            <div className="flex items-center text-xs text-gray-500 bg-gray-50 group-hover:bg-primary/10 px-2 py-1 rounded-lg w-fit transition-colors">
                <MapPinIcon className="h-4 w-4 mr-1.5 text-primary" />
                {doctor.office_address ? 'In-Person & Virtual' : 'Virtual Only'}
            </div>
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
            {doctor.specialties.slice(0, 2).map((spec, idx) => (
                <span key={idx} className="text-xs font-bold bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                    {spec.name}
                </span>
            ))}
            {doctor.specialties.length > 2 && (
                <span className="text-xs font-bold bg-gradient-to-r from-primary/10 to-teal-50 text-primary px-3 py-1 rounded-full border border-primary/20">
                    +{doctor.specialties.length - 2}
                </span>
            )}
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed flex-grow">
          {doctor.bio || `Dr. ${doctor.last_name} is a dedicated specialist with ${doctor.years_of_experience} years of experience.`}
        </p>

        <div className="pt-4 border-t-2 border-gray-100 mt-auto flex items-center justify-between gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-teal-50 px-3 py-2 rounded-xl">
                <p className="text-xs text-gray-500 font-medium">Consultation</p>
                <p className="text-base font-black text-primary">
                    {doctor.consultation_fee ? `₦${parseFloat(doctor.consultation_fee).toLocaleString()}` : 'Contact'}
                </p>
            </div>
            <Link
                to={`/doctors/${doctor.id}`}
                className="group/btn px-5 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm font-bold rounded-xl hover:from-primary hover:to-teal-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
                View Profile
                <ArrowRightIcon className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;