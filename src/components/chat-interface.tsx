'use client';

import { Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function ChatInterface() {
  return (
    <div className="space-y-4">
      <Card className="p-6 shadow-lg">
        <div className="space-y-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-lg font-medium">
              Create a checklist for opening a new LAA family office.
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="mb-4">Of course! Here&rsquo;s the checklist.</p>
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 font-medium">A. Supervisor Requirements</h3>
                <div className="ml-4">
                  <p className="mb-2">1. Qualified Supervisor must:</p>
                  <ul className="ml-4 list-disc space-y-2 text-gray-600">
                    <li>Have current practicing certificate</li>
                    <li>Have 3 years&rsquo; experience in family law</li>
                    <li>Meet case hours requirement</li>
                    <li>Be employed at least 17.5 hours per week</li>
                    <li>Be accessible to staff during business hours</li>
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-medium">B. Office Requirements</h3>
                <div className="ml-4">
                  <p className="mb-2">1. Premises must:</p>
                  <ul className="ml-4 list-disc space-y-2 text-gray-600">
                    <li>Be permanent physical location</li>
                    <li>Have full-time presence during business hours</li>
                    <li>Be accessible to clients</li>
                    <li>Have private meeting facilities</li>
                    <li>Have secure file storage</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <div className="relative">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <p className="text-gray-500">Message Compl-AI</p>
            <Button variant="ghost" size="icon" className="ml-auto">
              <Upload className="h-4 w-4" />
              <span className="sr-only">Upload files</span>
            </Button>
          </div>
        </Card>
      </div>
      <div className="flex justify-center gap-2">
        <div className="h-2 w-2 rounded-full bg-blue-600" />
        <div className="h-2 w-2 rounded-full bg-gray-300" />
        <div className="h-2 w-2 rounded-full bg-gray-300" />
      </div>
    </div>
  );
}
