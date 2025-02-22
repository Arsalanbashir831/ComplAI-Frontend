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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">User Query Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <p className="font-semibold">Query:</p>
            <p className="text-gray-700">{activity.query ?? 'N/A'}</p>
          </div>
          <div>
            <p className="font-semibold">Timestamp:</p>
            <p className="text-gray-700">
              {new Date(activity.usage_date).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="font-semibold">AI Response:</p>
            <div className="bg-gray-100 text-gray-900 p-3 rounded-md border max-h-60 overflow-y-auto">
              <ReactMarkdown>{activity.description ?? 'N/A'}</ReactMarkdown>
            </div>
          </div>
          <div>
            <p className="font-semibold">AI Response Document:</p>
            {activity.ai_response_document ? (
              <a
                href={activity.ai_response_document}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                ai_response.txt
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
