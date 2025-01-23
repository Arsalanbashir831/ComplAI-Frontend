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
  uploadedFiles: UploadedFile[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  onClose: () => void;
  onUpload: (files: File[]) => void;
}

export interface FileCardProps {
  file: UploadedFile;
  showExtraInfo?: boolean;
  onRemove?: (id: string) => void;
  titleColor?: string;
  className?: string;
  hasShareButton?: boolean;
}
