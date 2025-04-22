'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import DashboardHeader from '@/components/dashboard/dashboard-header';

// Sample issues data
const SAMPLE_ISSUES = [
    {
        id: 1,
        type: 'Missing Specific Jurisdiction Clause',
        text: '"This Client Care Policy outlines our commitment to professionalism, transparency..."',
    },
    {
        id: 2,
        type: 'Ambiguous Timeframe in Response Commitment',
        text: '"Aim to respond to emails and calls within two working days."',
    },
    {
        id: 3,
        type: 'Title: Placeholder Content Detected',
        text: '"[Insert your practice areas, e.g., Family Law, Conveyancing...]"',
    },
    {
        id: 4,
        type: 'Vague Fee Adjustment Policy',
        text: '"Any changes to fees will be communicated in writing and require your consent."',
    },
    {
        id: 5,
        type: 'Missing Indemnification Clause',
        text: '"Lorem ipsum" lacks an indemnification clause',
    },
    {
        id: 6,
        type: 'Missing Indemnification Clause',
        text: '"Lorem ipsum" lacks an indemnification clause',
    },
    {
        id: 7,
        type: 'Missing Indemnification Clause',
        text: '"Lorem ipsum" lacks an indemnification clause',
    },
    {
        id: 8,
        type: 'Missing Indemnification Clause',
        text: '"Lorem ipsum" lacks an indemnification clause',
    },
    {
        id: 9,
        type: 'Missing Indemnification Clause',
        text: '"Lorem ipsum" lacks an indemnification clause',
    },
];

export default function AICorrection() {
    const [issues] = useState(SAMPLE_ISSUES);

    return (
        <div className="w-full p-6">
            <DashboardHeader title="Document Compliance" />

            <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">AI Compliance Report</h2>
                    <Link href={ROUTES.DOC_COMPLIANCE_AI_EDITOR}>
                        <Button className="bg-[#1D1E4A] hover:bg-[#2d2e6a] text-white w-52">
                            <Image
                                src="/icons/ai.svg"
                                width={18}
                                height={18}
                                alt="AI"
                                className="mr-2"
                            />
                            AI Correction
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold">Issues</h3>
                    <span className="bg-[#07378C] text-white text-xs rounded-full p-2 px-3">
                        {issues.length}
                    </span>
                </div>

                <ScrollArea className="h-[500px] rounded-md border">
                    <div className="p-4">
                        {issues.map((issue) => (
                            <div key={issue.id} className="py-4 border-b last:border-b-0">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-500">
                                            {issue.type}
                                        </p>
                                        <p className="text-black mt-1">{issue.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
