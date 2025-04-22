"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

import DashboardHeader from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"

interface UploadedFile {
    id: string
    name: string
    size: number
    type: string
    status: string
    file: File
}

export default function DocCompliancePage() {
    const router = useRouter()
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isReviewing, setIsReviewing] = useState(false)

    const handleUpload = (files: File[]) => {
        setIsUploading(true)

        // Simulate file upload
        setTimeout(() => {
            const newFiles = files.map((file) => ({
                id: Math.random().toString(36).substring(2, 9),
                name: file.name,
                size: Math.round(file.size / 1024), // Convert to KB
                type: file.type,
                status: "uploaded",
                file,
            }))

            setUploadedFiles(newFiles)
            setIsUploading(false)
        }, 1500)
    }

    const handleRemoveFile = (id: string) => {
        setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files)
            handleUpload(files)
        }
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files)
            handleUpload(files)
        }
    }

    const handleAIReview = () => {
        setIsReviewing(true)

        // Simulate AI review process
        setTimeout(() => {
            router.push("/doc-compliance/ai-correction")
        }, 3000)
    }

    if (isReviewing) {
        return (
            <div className="w-full p-6  h-screen bg-white border">
                <DashboardHeader title="Document Compliance" />

                <div className="w-full flex flex-col items-center justify-center  mt-12">
                    <div className="relative w-full h-[200px] mb-8">
                        <Image 
                            src="/animation.gif" 
                            alt="AI reviewing" 
                              fill                           
                            className="object-contain" 
                            unoptimized
                        />
                    </div>
                    <p className="text-lg text-gray-600">AI is reviewing your document...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full px-6 py-5 ">
            <DashboardHeader title="Document Compliance" />

            <div className="mt-1 w-full bg-[#0A58EB] text-white py-4 px-14  rounded-xl">
                <h2 className="text-3xl font-bold mb-1">AI-Powered Doc Compliance</h2>
                <p className="text-md opacity-90">
                    Compliance AI uses advanced artificial intelligence to instantly scan your legal, business, policy documents
                    or others for compliance gaps, risky language, and missing clauses.
                </p>
            </div>

            <div className="mt-4 bg-white p-6 rounded-xl shadow-sm ">
                <div className="flex items-start gap-4">
                    <div className="bg-[#1D1E4A] p-3 rounded-3xl">
                        <Image src="/icons/plain-document.svg" width={38} height={38} alt="Document" />
                    </div>
                    <div>
                        <h3 className="text-xl ">Upload Your Documents</h3>
                        <p className="text-gray-600">Easily scan and manage compliance issues with just a few clicks!</p>
                    </div>
                </div>

                {uploadedFiles.length > 0 ? (

                    <div className="flex flex-col justify-center items-center py-10">
                        <div className="mt-6 w-1/2 bg-[#EBECFF] rounded-xl p-6">
                            <h4 className="text-lg font-medium mb-4">Uploaded File(s)</h4>

                            {uploadedFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between bg-[#07378C] text-white p-3 rounded-lg mb-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <Image src="/icons/word-document.svg" width={24} height={24} alt={file.name} />
                                        <div>
                                            <p className="font-medium">{file.name}</p>
                                            <p className="text-sm opacity-80">
                                                {file.size} KB {isUploading ? "Uploading..." : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFile(file.id)}
                                        className="text-white hover:bg-blue-700 rounded-full p-1"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}

                        </div>
                        <div className="mt-4 w-1/2">
                            <Button onClick={handleAIReview} className="w-full bg-[#1D1E4A] hover:bg-[#2d2e6a] text-white">
                                <Image src="/icons/ai.svg" width={18} height={18} alt="AI" className="mr-2" />
                                AI Review
                            </Button>
                        </div>
                    </div>

                ) : (
                    <div className="flex justify-center items-center py-10">
                        <div
                            className="mt-6 w-1/2 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer bg-[#F8F9FF]"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById("file-upload")?.click()}
                        >
                            <div className="mb-4">

                                <Image src="/icons/file-upload.svg" width={60} height={60} alt="Upload" />

                            </div>
                            <h4 className="text-lg font-medium mb-2">Drag and drop here</h4>
                            <p className="text-gray-500 text-sm">File type must be (TXT, PDF and Word Doc)</p>

                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".txt,.pdf,.doc,.docx"
                                multiple
                                onChange={handleFileInputChange}
                            />
                        </div>
                    </div>

                )}
            </div>
        </div>
    )
}
