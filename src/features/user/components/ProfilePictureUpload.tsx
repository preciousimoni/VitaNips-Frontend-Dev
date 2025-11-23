import React, { useState, useRef } from 'react';
import { UserIcon, CameraIcon } from '@heroicons/react/24/outline';
import { uploadProfilePicture } from '../../../api/user';
import Spinner from '../../../components/ui/Spinner';
import toast from 'react-hot-toast';

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null;
  onUploadSuccess: (newUrl: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  onUploadSuccess,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Image size should be less than 5MB.');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const updatedUser = await uploadProfilePicture(file);
      if (updatedUser.profile_picture) {
        onUploadSuccess(updatedUser.profile_picture);
        toast.success('Profile picture updated!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload profile picture.');
      setPreviewUrl(currentImageUrl || null); // Revert preview
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group cursor-pointer" onClick={triggerFileInput}>
        <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserIcon className="h-16 w-16 text-gray-400" />
          )}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <CameraIcon className="h-8 w-8 text-white" />
        </div>

        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
            <Spinner size="md" />
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <button 
        type="button"
        onClick={triggerFileInput}
        className="text-sm text-primary hover:text-primary-dark font-medium"
        disabled={isUploading}
      >
        Change Profile Picture
      </button>
    </div>
  );
};

export default ProfilePictureUpload;

