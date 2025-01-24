export interface Video {
  id: string;
  title: string;
  studio: string;
  description: string;
  thumbnail: string;
  tags: string[];
}

export interface VideoSection {
  title: string;
  subtitle: string;
  videos: Video[];
}
