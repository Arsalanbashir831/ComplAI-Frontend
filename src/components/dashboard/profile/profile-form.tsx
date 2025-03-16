'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useUserContext } from '@/contexts/user-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';

import apiCaller from '@/config/apiCaller';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  ProfileFormFields,
  profileSchema,
  type ProfileFormValues,
} from './profile-form-fields';

export default function ProfileForm() {
  // Access both the current user and the setUser function from the context
  const { user, setUser, refresh } = useUserContext();

  const [isEditable, setIsEditable] = useState(false);
  const [showUserId, setShowUserId] = useState(false);

  const { control, handleSubmit, reset, watch } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      id: '',
      username: '',
      email: '',
      phoneNumber: '',
      jobTitle: '',
      creationDate: new Date(),
    },
  });

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
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, [reset, refresh]);

  // Function to handle image uploads. This is now available regardless of edit mode.
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];

    try {
      await apiCaller(
        API_ROUTES.USER.UPDATE_PROFILE_IMAGE,
        'POST',
        { profile_picture: file },
        {},
        true,
        'formdata'
      );

      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          profile_picture:
            process.env.NEXT_PUBLIC_BACKEND_URL +
            '/media/profile_pictures/' +
            file.name,
        };
      });
      // Refresh user data to ensure context stays up-to-date
      refresh();
    } catch (error) {
      console.error('Failed to update profile image:', error);
    }
  };

  const toggleEdit = () => setIsEditable((prev) => !prev);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const response = await apiCaller(
        API_ROUTES.USER.GET_USER_DATA, // Consider using a dedicated update endpoint
        'PUT',
        {
          username: data.username,
          email: data.email,
          phone_number: data.phoneNumber,
          job_title: data.jobTitle,
        },
        {},
        true,
        'json'
      );
      // Update the user context with the new data
      setUser(response.data);
      // Refresh user data to ensure context stays up-to-date
      refresh();
      // toggleEdit();
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
        {/* Responsive Profile Image Container */}
        <div className="relative aspect-square w-16 md:w-20 lg:w-24 group overflow-hidden rounded-full">
          <Image
            src={user?.profile_picture || '/user.png'}
            alt="Profile Avatar"
            fill
            className="rounded-full object-cover"
          />
          {/* Overlay shown on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-white text-sm font-medium">Change</span>
          </div>
          {/* Always render file input so user can change image */}
          <input
            type="file"
            onChange={handleImageUpload}
            className={cn(
              'absolute inset-0 w-full h-full opacity-0 cursor-pointer'
            )}
          />
        </div>

        <div className="relative">
          <h1 className="text-xl md:text-3xl font-bold">
            {user?.username || 'User Name'}
          </h1>
        </div>

        <div className="mt-2 text-gray-500 relative cursor-pointer flex items-center gap-2">
          <span className={showUserId ? 'text-black' : 'blur-sm'}>
            {showUserId ? `UserID: ${userId}` : 'UserID: ******'}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  className="text-gray-700 hover:text-black relative p-0 h-fit bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserId((prev) => !prev);
                  }}
                >
                  {showUserId ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs bg-gray-800 p-2 py-1 text-white">
                {showUserId ? 'Hide ID' : 'Reveal ID'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
        </div>
      </div>

      <ProfileFormFields control={control} isEditable={isEditable} />
    </form>
  );
}
