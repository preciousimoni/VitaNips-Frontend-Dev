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
    <div className="group bg-white rounded-[2rem] border-2 border-primary-900/5 hover:border-primary-900 transition-all duration-300 flex flex-col overflow-hidden h-full relative shadow-sm hover:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)]">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-gray-100 m-3 rounded-[1.5rem]">
        <SmartImage
          src={doctor.profile_picture || placeholderImage}
          placeholderSrc={placeholderImage}
          alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          eager={false}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-3 right-3 z-10">
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex items-center bg-white px-3 py-1.5 rounded-xl shadow-md text-xs font-black text-primary-900 border border-primary-900/10"
             >
                <StarIcon className="h-4 w-4 text-accent mr-1.5" />
                {doctor.average_rating > 0 ? doctor.average_rating.toFixed(1) : 'New'}
             </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-5 pt-2 flex flex-col flex-grow">
        <div className="mb-4">
            <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-primary-900 group-hover:text-primary transition-colors flex items-center mb-1 font-display leading-tight">
                    {doctor.full_name}
                </h3>
                {doctor.is_verified && (
                    <div className="bg-blue-50 p-1 rounded-full">
                        <CheckBadgeIcon className="h-5 w-5 text-blue-600" title="Verified Specialist" />
                    </div>
                )}
            </div>
            
            <p className="text-sm font-bold text-accent mb-2">{doctor.specialties[0]?.name || 'General Practice'}</p>

            <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-300" />
                {doctor.office_address ? 'In-Person & Virtual' : 'Virtual Only'}
            </div>
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
            {doctor.specialties.slice(0, 2).map((spec, idx) => (
                <span key={idx} className="text-[10px] font-bold bg-cream-100 text-primary-900 px-3 py-1.5 rounded-lg border border-primary-900/5 uppercase tracking-wide">
                    {spec.name}
                </span>
            ))}
            {doctor.specialties.length > 2 && (
                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg border border-gray-200">
                    +{doctor.specialties.length - 2}
                </span>
            )}
        </div>

        <div className="pt-4 border-t-2 border-gray-100 mt-auto flex items-center justify-between gap-3">
            <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Consultation</p>
                <p className="text-lg font-black text-primary-900">
                    {doctor.consultation_fee ? `₦${parseFloat(doctor.consultation_fee).toLocaleString()}` : 'Contact'}
                </p>
            </div>
            <Link
                to={`/doctors/${doctor.id}`}
                className="group/btn px-5 py-3 bg-primary-900 text-white text-sm font-bold rounded-xl hover:bg-accent transition-all shadow-md flex items-center gap-2"
            >
                View
                <ArrowRightIcon className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;