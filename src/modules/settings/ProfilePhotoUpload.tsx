import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, X, User } from 'lucide-react';
import { toast } from 'sonner';

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (file: File | null) => void;
  userName?: string;
}

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhoto,
  onPhotoChange,
  userName = '',
}) => {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.photo.invalidType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.photo.tooLarge'));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onPhotoChange(file);
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = preview || currentPhoto;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
          {displayImage ? (
            <AvatarImage src={displayImage} alt={userName} className="object-cover" />
          ) : (
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {userName ? getInitials(userName) : <User className="h-12 w-12" />}
            </AvatarFallback>
          )}
        </Avatar>
        
        {/* Overlay on hover */}
        <div 
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-8 w-8 text-white" />
        </div>

        {/* Remove button */}
        {displayImage && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-1 -right-1 h-8 w-8 rounded-full shadow-md"
            onClick={handleRemovePhoto}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Camera className="h-4 w-4 mr-2" />
        {displayImage ? t('profile.photo.change') : t('profile.photo.upload')}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        {t('profile.photo.hint')}
      </p>
    </div>
  );
};
