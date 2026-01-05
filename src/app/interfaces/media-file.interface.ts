export interface Dimensions {
  width: number;
  height: number;
}

export interface MediaFile {
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  dimensions?: Dimensions;
  uploadedAt: Date | string;
}

export interface VideoFile extends MediaFile {
  duration?: number; // Video duration in seconds
  posterImage?: string; // Poster/thumbnail image path
}

