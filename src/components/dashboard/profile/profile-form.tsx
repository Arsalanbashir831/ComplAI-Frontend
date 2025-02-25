'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { API_ROUTES } from '@/constants/apiRoutes';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';

import apiCaller from '@/config/apiCaller';
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

  const {
    control,
    handleSubmit,
    reset,
    watch,
    // formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      id: '',
      username: '',
      email: '',
      phoneNumber: '',
      jobTitle: '',
      creationDate: new Date(),
      // notificationsEnabled and emailUpdates commented out
    },
  });

  // For debugging, log errors
  // console.log('Form errors:', errors);

  // Watch the "id" field so we can display it
  const userId = watch('id');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiCaller(
          API_ROUTES.USER.GET_USER_DATA,
          'GET',
          {},
          {},
          true,
          'json'
        );
        const data = response.data;
        // Convert creationDate safely
        const fetchedDate = new Date(data.creationDate);
        const validDate = isNaN(fetchedDate.getTime())
          ? new Date()
          : fetchedDate;

        reset({
          id: data.id.toString(),
          username: data.username,
          email: data.email,
          phoneNumber: data.phone_number,
          jobTitle: data.job_title,
          creationDate: validDate,
          // notificationsEnabled and emailUpdates omitted for now
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, [reset]);

  const toggleEdit = () => setIsEditable((prev) => !prev);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const response = await apiCaller(
        API_ROUTES.USER.GET_USER_DATA,
        'PUT',
        {
          username: data.username,
          email: data.email,
          phone_number: data.phoneNumber,
          job_title: data.jobTitle,
          // notifications_enabled and email_updates omitted
        },
        {},
        true,
        'json'
      );
      console.log('Profile updated:', response.data);
      toggleEdit();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 pb-20 bg-white shadow-md rounded-xl w-full mx-auto"
    >
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        {/* Profile Image Container */}
        <div className={`relative w-16 h-16 ${isEditable ? 'group' : ''}`}>
          <Image
            src="/user.png"
            alt="Profile Avatar"
            width={64}
            height={64}
            className="rounded-full object-cover"
          />

          {isEditable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-sm font-medium">Change</span>
            </div>
          )}

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
            {showUserId ? `UserID: ${userId}` : 'UserID: ******'}
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
          {isEditable && (
            <Button type="submit" asChild={false}>
              Save Changes
            </Button>
          )}
          {/* For debugging, try using a native button:
          {isEditable && (
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Save Changes
            </button>
          )} */}
        </div>
      </div>

      <ProfileFormFields control={control} isEditable={isEditable} />
    </form>
  );
}
