// src/features/user/components/EmergencyContactListItem.tsx
import { 
    PencilSquareIcon, 
    TrashIcon, 
    PhoneIcon, 
    EnvelopeIcon, 
    UserCircleIcon,
    MapPinIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { EmergencyContact } from '../../../types/user';

interface EmergencyContactListItemProps {
    contact: EmergencyContact;
    onEdit: (contact: EmergencyContact) => void;
    onDelete: (id: number) => void;
}

const EmergencyContactListItem: React.FC<EmergencyContactListItemProps> = ({ contact, onEdit, onDelete }) => {
    const relationshipColors: Record<string, string> = {
        spouse: 'bg-pink-100 text-pink-700 border-pink-200',
        parent: 'bg-blue-100 text-blue-700 border-blue-200',
        child: 'bg-purple-100 text-purple-700 border-purple-200',
        sibling: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        relative: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        friend: 'bg-green-100 text-green-700 border-green-200',
        doctor: 'bg-teal-100 text-teal-700 border-teal-200',
        caregiver: 'bg-orange-100 text-orange-700 border-orange-200',
        other: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    const relationshipColor = relationshipColors[contact.relationship] || relationshipColors.other;

    return (
        <div className="p-6 hover:bg-gray-50 transition-colors group">
            <div className="flex items-start justify-between gap-4">
                {/* Left: Avatar and Info */}
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center border-2 border-white shadow-md">
                            <UserCircleIcon className="h-8 w-8 text-orange-600" />
                        </div>
                        {contact.is_primary && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                <StarIconSolid className="h-3.5 w-3.5 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg truncate">{contact.name}</h3>
                            {contact.is_primary && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                    <StarIcon className="h-3 w-3 mr-1" />
                                    Primary
                                </span>
                            )}
                        </div>
                        
                        <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-3 border ${relationshipColor}`}>
                            {contact.relationship.charAt(0).toUpperCase() + contact.relationship.slice(1)}
                        </div>

                        <div className="space-y-2">
                            <a 
                                href={`tel:${contact.phone_number}`} 
                                className="flex items-center text-sm text-gray-700 hover:text-orange-600 transition-colors group/phone"
                            >
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover/phone:bg-orange-200 transition-colors">
                                    <PhoneIcon className="h-4 w-4 text-orange-600" />
                                </div>
                                <span className="font-medium">{contact.phone_number}</span>
                            </a>

                            {contact.alternative_phone && (
                                <a 
                                    href={`tel:${contact.alternative_phone}`} 
                                    className="flex items-center text-sm text-gray-600 hover:text-orange-600 transition-colors group/phone"
                                >
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover/phone:bg-orange-100 transition-colors">
                                        <PhoneIcon className="h-4 w-4 text-gray-500 group-hover/phone:text-orange-600" />
                                    </div>
                                    <span>{contact.alternative_phone}</span>
                                </a>
                            )}

                            {contact.email && (
                                <a 
                                    href={`mailto:${contact.email}`} 
                                    className="flex items-center text-sm text-gray-600 hover:text-orange-600 transition-colors group/email"
                                >
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover/email:bg-orange-100 transition-colors">
                                        <EnvelopeIcon className="h-4 w-4 text-gray-500 group-hover/email:text-orange-600" />
                                    </div>
                                    <span className="truncate">{contact.email}</span>
                                </a>
                            )}

                            {contact.address && (
                                <div className="flex items-start text-sm text-gray-600">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                        <MapPinIcon className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <span className="leading-relaxed">{contact.address}</span>
                                </div>
                            )}

                            {contact.notes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-600 leading-relaxed">{contact.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => onEdit(contact)} 
                        className="p-2.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-colors shadow-sm hover:shadow"
                        title="Edit contact"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={() => onDelete(contact.id)} 
                        className="p-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors shadow-sm hover:shadow"
                        title="Delete contact"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmergencyContactListItem;