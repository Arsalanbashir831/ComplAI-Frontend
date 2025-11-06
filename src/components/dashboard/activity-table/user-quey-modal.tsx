'use client';

import ReactMarkdown from 'react-markdown';

import type { ActivityItem } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SafeDateDisplay } from '@/components/common/safe-date-display';

interface UserQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity?: ActivityItem | null;
}

export function UserQueryModal({
  isOpen,
  onClose,
  activity,
}: UserQueryModalProps) {
  // If no activity is provided, don't render the modal content
  if (!activity) return null;

  console.log(activity);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">User Query Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <p className="font-semibold">Query:</p>
            <p className="text-gray-700">
              {activity.user_message.content ?? 'N/A'}
            </p>
          </div>
          <div>
            <p className="font-semibold">Timestamp:</p>
            <SafeDateDisplay
              date={activity.usage_date}
              format="datetime"
              className="text-gray-700"
            />
          </div>
          <div>
            <p className="font-semibold">AI Response:</p>
            <div className="bg-gray-100 text-gray-900 p-3 rounded-md border max-h-60 overflow-y-auto">
              <ReactMarkdown>
                {activity.ai_message.content ?? 'N/A'}
              </ReactMarkdown>
            </div>
          </div>
          <div>
            <p className="font-semibold">AI Response Document:</p>
            {activity.ai_message.file ? (
              <a
                href={
                  process.env.NEXT_PUBLIC_BACKEND_URL + activity.ai_message.file
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {activity.ai_message.file.split('/').pop()}
              </a>
            ) : (
              'N/A'
            )}
          </div>
        </div>

        <Button variant="default" className="w-full mt-4" onClick={onClose}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
