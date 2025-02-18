'use client';

import { useState } from 'react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import {
  ProfileFormFields,
  profileSchema,
  type ProfileFormValues,
} from './profile-form-fields';

export default function ProfileForm() {
  const [isEditable, setIsEditable] = useState(false);
  const [showUserId, setShowUserId] = useState(false);

  const { control, handleSubmit, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: 'johndoe',
      email: 'john.doe@gmail.com',
      phoneNumber: '+1 234567890',
      jobTitle: 'Software Developer',
      accountType: 'personal',
      creationDate: new Date(),
      notificationsEnabled: true,
      emailUpdates: false,
    },
  });

  const toggleEdit = () => setIsEditable((prev) => !prev);

  const onSubmit = (data: ProfileFormValues) => {
    console.log(data);
    toggleEdit(); // Toggle back to view mode after saving
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 pb-20 bg-white shadow-md rounded-xl w-full mx-auto"
    >
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        {/* Profile Image Container - Hover effect only in edit mode */}
        <div className={`relative w-16 h-16 ${isEditable ? 'group' : ''}`}>
          {/* Profile Image */}
          <Image
            src="/user.png"
            alt="Profile Avatar"
            width={64}
            height={64}
            className="rounded-full object-cover"
          />

          {/* Hover Overlay (Only visible in edit mode) */}
          {isEditable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-sm font-medium">Change</span>
            </div>
          )}

          {/* Hidden File Input - Disabled when not in edit mode */}
          <input
            type="file"
            disabled={!isEditable}
            className={`absolute inset-0 w-full h-full opacity-0 ${
              isEditable ? 'cursor-pointer' : 'cursor-default'
            }`}
          />
        </div>

        <div className="relative">
          <h1 className="text-xl md:text-3xl font-bold">John Doe</h1>
        </div>

        <div className="mt-2 text-gray-500 relative cursor-pointer flex items-center gap-2 group">
          <span className={showUserId ? 'text-black' : 'blur-sm'}>
            {showUserId ? 'UserID: 123456' : 'UserID: ******'}
          </span>
          <button
            type="button"
            className={cn(
              'text-gray-700 hover:text-black',
              showUserId ? '' : 'blur-sm',
              'group-hover:blur-none'
            )}
            onClick={() => setShowUserId((prev) => !prev)}
          >
            {showUserId ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="md:ml-auto flex gap-4">
          <Button
            type="button"
            variant={isEditable ? 'outline' : 'default'}
            onClick={
              isEditable
                ? () => {
                    reset();
                    toggleEdit();
                  }
                : toggleEdit
            }
          >
            {isEditable ? 'Cancel' : 'Edit Info'}
          </Button>
          {isEditable && <Button type="submit">Save Changes</Button>}
        </div>
      </div>

      <ProfileFormFields control={control} isEditable={isEditable} />
    </form>
  );
}
