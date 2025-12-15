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
        spouse: 'bg-pink-100 text-pink-900 border-pink-200',
        parent: 'bg-blue-100 text-blue-900 border-blue-200',
        child: 'bg-purple-100 text-purple-900 border-purple-200',
        sibling: 'bg-indigo-100 text-indigo-900 border-indigo-200',
        relative: 'bg-cyan-100 text-cyan-900 border-cyan-200',
        friend: 'bg-green-100 text-green-900 border-green-200',
        doctor: 'bg-red-100 text-red-900 border-red-200',
        caregiver: 'bg-orange-100 text-orange-900 border-orange-200',
        other: 'bg-gray-100 text-gray-900 border-gray-200',
    };

    const relationshipColor = relationshipColors[contact.relationship] || relationshipColors.other;

    return (
        <div className="bg-white rounded-[2rem] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 group hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                {/* Left: Avatar and Info */}
                <div className="flex items-start space-x-6 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 bg-cream-50 rounded-2xl flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <UserCircleIcon className="h-10 w-10 text-primary-900" />
                        </div>
                        {contact.is_primary && (
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <StarIconSolid className="h-5 w-5 text-black" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="font-black text-primary-900 text-xl truncate font-display uppercase tracking-tight">{contact.name}</h3>
                            {contact.is_primary && (
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-yellow-300 text-black border-2 border-black uppercase tracking-wide">
                                    <StarIcon className="h-3 w-3 mr-1 stroke-2" />
                                    Primary
                                </span>
                            )}
                            <div className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] ${relationshipColor}`}>
                                {contact.relationship.charAt(0).toUpperCase() + contact.relationship.slice(1)}
                            </div>
                        </div>

                        <div className="space-y-3 mt-4">
                            <div className="flex flex-wrap gap-4">
                                <a 
                                    href={`tel:${contact.phone_number}`} 
                                    className="flex items-center text-sm font-bold text-gray-800 hover:text-black transition-colors group/phone bg-cream-50 px-3 py-2 rounded-xl border-2 border-primary-900/10 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    <PhoneIcon className="h-4 w-4 mr-2 text-primary-900" />
                                    <span>{contact.phone_number}</span>
                                </a>

                                {contact.alternative_phone && (
                                    <a 
                                        href={`tel:${contact.alternative_phone}`} 
                                        className="flex items-center text-sm font-bold text-gray-600 hover:text-black transition-colors group/phone bg-cream-50 px-3 py-2 rounded-xl border-2 border-primary-900/10 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-500" />
                                        <span>{contact.alternative_phone}</span>
                                    </a>
                                )}
                            </div>

                            {contact.email && (
                                <a 
                                    href={`mailto:${contact.email}`} 
                                    className="flex items-center w-fit text-sm font-bold text-gray-600 hover:text-black transition-colors group/email"
                                >
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-2">
                                        <EnvelopeIcon className="h-5 w-5 text-gray-500 group-hover/email:text-black" />
                                    </div>
                                    <span className="truncate underline decoration-2 decoration-gray-300 underline-offset-2 group-hover/email:decoration-black">{contact.email}</span>
                                </a>
                            )}

                            {contact.address && (
                                <div className="flex items-start text-sm font-medium text-gray-600 max-w-md">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 mt-[-2px]">
                                        <MapPinIcon className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <span className="leading-relaxed">{contact.address}</span>
                                </div>
                            )}

                            {contact.notes && (
                                <div className="mt-4 p-4 bg-yellow-50 rounded-xl border-2 border-black relative">
                                    <p className="text-xs font-black text-black uppercase tracking-widest mb-1">Notes</p>
                                    <p className="text-sm font-bold text-gray-800 leading-relaxed">{contact.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-row sm:flex-col gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                    <button 
                        onClick={() => onEdit(contact)} 
                        className="p-3 bg-white text-black rounded-xl border-2 border-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px]"
                        title="Edit contact"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={() => onDelete(contact.id)} 
                        className="p-3 bg-red-100 text-red-600 rounded-xl border-2 border-black hover:bg-red-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px]"
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