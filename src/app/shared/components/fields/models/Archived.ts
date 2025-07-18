export interface Archived {
    id: number;
    fileName: string;
    originalFileName: string;
    mimeType: string;
    fileSize: number;
    folderName: string;
    filePath: string;
    uploadDate: string;
    uploadedBy: number;
    description: string;
    tenantUniqueID: string;
    metadata: string;
    notes: string;
    relatedEntityType: string;
    relatedEntityId: number;
    storageLocation: string;
    version: number;
    thumbnailPath: any;
  }