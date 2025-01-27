export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  studio: string;
  url: string;
  tags: string[];
}

export interface VideoSection {
  title: string;
  subtitle: string;
  videos: Video[];
}
