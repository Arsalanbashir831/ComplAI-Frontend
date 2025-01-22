export interface UploadedFile extends File {
  id: string;
  progress?: number;
}

export interface FileUploadProps {
  onUpload: (files: File[]) => void;
  maxSize?: number;
  allowedTypes?: string[];
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
}

export interface FileCardProps {
  file: UploadedFile;
  type: string;
  onRemove: (id: string) => void;
}
