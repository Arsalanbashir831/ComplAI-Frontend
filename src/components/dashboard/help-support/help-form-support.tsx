'use client';

import { FormEvent, useState } from 'react';
import { API_ROUTES } from '@/constants/apiRoutes';

import apiCaller from '@/config/apiCaller';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import SuccessSubmissionModal from '@/components/modals/SuccessSubmissionModal';

export default function SupportForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = {
        full_name: fullName,
        email,
        version: selectedVersion,
        description,
      };
      const response = await apiCaller(
        API_ROUTES.SUPPORT.HELP,
        'POST',
        data,
        {},
        true,
        'json',
        false
      );
      if (response.status === 200 || response.status === 201) {
        // Reset fields
        setFullName('');
        setEmail('');
        setSelectedVersion('');
        setDescription('');
        // Show success modal
        setShowSuccessModal(true);
      } else {
        setError('Failed to submit. Please try again later.');
      }
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-start  px-4 md:px-0 bg-gray-50">
        <h1 className="text-3xl font-bold py-10">Help and Support Form</h1>
        <form
          onSubmit={handleSubmit}
          className={cn(
            'w-full max-w-3xl space-y-6 bg-white p-8 rounded-lg shadow-md'
          )}
        >
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <Input
            placeholder="Your full name"
            className="py-3"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            type="email"
            placeholder="Your email"
            className="py-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Select onValueChange={setSelectedVersion} value={selectedVersion}>
            <SelectTrigger
              className={cn(
                !selectedVersion && 'text-muted-foreground',
                'py-3'
              )}
            >
              <SelectValue placeholder="Version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compl-ai-v1">Compl-AI-v1</SelectItem>
              <SelectItem value="compl-ai-v2">Compl-AI-v2</SelectItem>
              <SelectItem value="compl-ai-v3">Compl-AI-v3</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Description"
            className="h-48 py-3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full transition-all duration-300 ease-in-out py-3"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Support Request'}
          </Button>
        </form>
      </div>

      {/* Success modal */}
      <SuccessSubmissionModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
}
