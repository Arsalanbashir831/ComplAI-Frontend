export interface UploadedFile extends File {
  rawFile: File;
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
  file: UploadedFile | File | string;
  showExtraInfo?: boolean;
  onRemove?: (id: string) => void;
  titleColor?: string;
  hasShareButton?: boolean;
  className?: string;
}

export interface UploadedFilesProps extends FileUploadProps {
  containerClassName?: string;
  className?: string;
  filesContainerClassName?: string;
  uploadedFiles: UploadedFile[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}
