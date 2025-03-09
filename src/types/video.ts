export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  studio: string;
  video_url: string;
  tags: string[];
  video_type: 'video' | 'tutorial';
  pdf_file: string;
}

export interface VideoSection {
  title: string;
  subtitle: string;
  videos: Video[];
}
