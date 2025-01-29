'use client';

import { useState } from 'react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';

import {
  ProfileFormFields,
  profileSchema,
  type ProfileFormValues,
} from './profile-form-fields';

export default function ProfileForm() {
  const [isEditable, setIsEditable] = useState(false);

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
    // Here you would typically send the data to your backend
    toggleEdit();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 pb-20 bg-white shadow-md rounded-xl w-full mx-auto"
    >
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative">
          <Image
            src="/user.png"
            alt="Profile Avatar"
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <h1 className="text-xl md:text-3xl font-bold">John Doe</h1>
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
