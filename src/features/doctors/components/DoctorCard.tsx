import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, CheckBadgeIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { Doctor } from '../../../types/doctors';
import SmartImage from '../../../components/common/SmartImage';

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const placeholderImage = '/images/doctor-placeholder.svg';

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col overflow-hidden h-full">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-gray-50">
        <SmartImage
          src={doctor.profile_picture || placeholderImage}
          placeholderSrc={placeholderImage}
          alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          eager={false}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        
        {/* Overlay Badges */}
        <div className="absolute bottom-3 left-3 text-white">
            <p className="text-xs font-medium bg-primary/90 px-2 py-1 rounded-md backdrop-blur-sm inline-block mb-1">
                {doctor.specialties[0]?.name || 'General Practice'}
            </p>
        </div>
        
        <div className="absolute top-3 right-3">
             <div className="flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm text-xs font-bold text-gray-800">
                <StarIcon className="h-3 w-3 text-yellow-400 mr-1" />
                {doctor.average_rating > 0 ? doctor.average_rating.toFixed(1) : 'New'}
             </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 truncate flex items-center">
                {doctor.full_name}
                {doctor.is_verified && (
                    <CheckBadgeIcon className="h-5 w-5 text-blue-500 ml-1.5 flex-shrink-0" title="Verified Specialist" />
                )}
            </h3>
            <p className="text-xs text-gray-500 flex items-center mt-1">
                <MapPinIcon className="h-3 w-3 mr-1" />
                {doctor.office_address ? 'In-Person & Virtual' : 'Virtual Only'}
            </p>
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
            {doctor.specialties.slice(0, 2).map((spec, idx) => (
                <span key={idx} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {spec.name}
                </span>
            ))}
            {doctor.specialties.length > 2 && (
                <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    +{doctor.specialties.length - 2}
                </span>
            )}
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed flex-grow">
          {doctor.bio || `Dr. ${doctor.last_name} is a dedicated specialist with ${doctor.years_of_experience} years of experience.`}
        </p>

        <div className="pt-4 border-t border-gray-50 mt-auto flex items-center justify-between gap-3">
            <div>
                <p className="text-xs text-gray-400">Consultation</p>
                <p className="text-sm font-bold text-primary">
                    {doctor.consultation_fee ? `₦${parseFloat(doctor.consultation_fee).toLocaleString()}` : 'Contact'}
                </p>
            </div>
            <Link
                to={`/doctors/${doctor.id}`}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-primary transition-colors shadow-sm"
            >
                View Profile
            </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;