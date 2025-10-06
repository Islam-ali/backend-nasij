import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { MessageService } from "primeng/api";
import { FileUploadModule } from "primeng/fileupload";
import { ButtonModule } from "primeng/button";
import { CommonModule } from "@angular/common";
import { BadgeModule } from "primeng/badge";
import { ProgressBarModule } from "primeng/progressbar";
import { ToastModule } from "primeng/toast";
import { FormsModule, FormControl, AbstractControl } from "@angular/forms";
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { UploadFilesService } from "./upload-files.service";
import { SafePipe } from "../../../../core/pipes/safe.pipe";
import { ComponentBase } from "../../../../core/directives/component-base.directive";
import { BaseResponse } from "../../../../core/models/baseResponse";
import { Archived } from "../models/Archived";
import { environment } from "../../../../../environments/environment";

interface FileWithProgress {
  file: File | any;
  type: string;
  content?: string;
  iconClass?: string;
  size: string;
  sizeBytes: number;
  name: string;
  progress: number;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  id: string;
  description: string;
}

@Component({
  selector: "app-upload-files",
  templateUrl: './upload-files.component.html',
  styleUrl: './upload-files.component.scss',
  standalone: true,
  imports: [
    FileUploadModule,
    ButtonModule,
    BadgeModule,
    ProgressBarModule,
    ToastModule,
    CommonModule,
    SafePipe,
    FormsModule
  ],
  providers: [MessageService],
})
export class UploadFilesComponent extends ComponentBase implements OnChanges {
  @Input() index: number = 0;
  @Input() control!: AbstractControl;
  
  ngOnInit() {
    console.log('UploadFilesComponent initialized with index:', this.index, 'ID:', `dropzone-file-${this.index}`);
  }
  @Input() isApi: boolean = true;
  @Input() isDescription: boolean = false;
  @Input() loadingExport: boolean = false;
  @Input() filesServer: Archived | Archived[] = [];
  @Input() multiple: boolean = false;
  @Input() accept: string = "";
  @Output() onExportFiles: EventEmitter<any> = new EventEmitter<any>();
  files: { file: FileWithProgress, Result: Archived }[] = [];
  totalSize: number = 0;
  totalSizePercent: number = 0;
  selectedFiles: FileWithProgress[] = [];

  constructor(
    private _uploadFilesService: UploadFilesService,
    private messageService: MessageService,
    private cdr:ChangeDetectorRef
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges - index:', this.index, 'changes:', changes);
    console.log(this.control.value);
    if (changes['filesServer'] && changes['filesServer'].currentValue) {
      // Convert to array if single object
      const filesArray = Array.isArray(this.filesServer) ? this.filesServer : [this.filesServer];
      
      this.selectedFiles = filesArray.map((file: Archived) => ({
        file: file,
        type: file.mimeType,
        content: environment.baseUrl + file.filePath,
        iconClass: this.getFileIconClass(file.mimeType),
        size: this.formatBytes(file.fileSize),
        sizeBytes: file.fileSize,
        name: file.originalFileName,
        progress: 100,
        uploading: false,
        uploaded: true,
        error: undefined,
        id: file.id.toString(),
        description: file.description || '',
      }));
      this.files = this.selectedFiles.map((file) => {
        const existingFile = filesArray.find((f: Archived) => f.originalFileName === file.name);
        return {
          file: {
            ...file,
            uploading: false,
            uploaded: false,
            error: undefined,
            progress: 0,
            description: file.description
          } as FileWithProgress,
          Result: existingFile
        };
      }).filter((item): item is { file: FileWithProgress; Result: Archived } => {
        return item.Result !== null;
      }) as { file: FileWithProgress; Result: Archived }[];
      this.updateFormControl();
      this.cdr.detectChanges();
    }
  }

  onFilesSelected(event: Event): void {
    console.log('onFilesSelected - index:', this.index, 'ID:', `dropzone-file-${this.index}`);
    const input = event.target as HTMLInputElement;

    if (input.files) {
      const newFiles: FileWithProgress[] = Array.from(input.files).map((file) => ({
        file: file,
        name: file.name,
        type: file.type,
        sizeBytes: file.size,
        size: this.formatBytes(file.size),
        iconClass: this.getFileIconClass(file.type),
        progress: 0,
        uploading: false,
        uploaded: false,
        id: this.generateId(),
        description: '',
      }));

      if (!this.multiple) {
        // For single file upload, replace the current file
        this.selectedFiles = [newFiles[0]];
        this.files = [];
      } else {
        // For multiple files, filter out duplicates and add new files
        const filteredFiles = newFiles.filter(
          (newFile) =>
            !this.selectedFiles.some(
              (existing) => existing.name === newFile.name
            )
        );
        this.selectedFiles = [...this.selectedFiles, ...filteredFiles];
      }

      if (this.isApi) {
        // Start uploading each file
        const filesToUpload = this.multiple ? newFiles : [newFiles[0]];
        filesToUpload.forEach((fileObj) => {
          this.uploadFile(fileObj);
        });
      } else {
        this.updateFormControl();
      }

      this.readFiles(this.multiple ? newFiles : [newFiles[0]]);
    }
  }

  uploadFile(fileObj: FileWithProgress): void {
    console.log('uploadFile - index:', this.index, 'file:', fileObj.name);
    this.updateFileState(fileObj.id, { uploading: true, progress: 0, error: undefined });

    this._uploadFilesService.PostImageFile({ file: fileObj.file, folderName: 'Uploads' }).subscribe({
      next: (event: HttpEvent<BaseResponse<Archived>>) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            const progress = Math.round(100 * event.loaded / event.total);
            this.updateFileState(fileObj.id, { progress });
          }
        } else if (event instanceof HttpResponse) {
          this.updateFileState(fileObj.id, {
            uploading: false,
            uploaded: true,
            progress: 100
          });

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${fileObj.name} uploaded successfully`
          });

          const responseData = event.body?.data;
          if (responseData) {
            this.files.push({ file: fileObj, Result: responseData });
            this.updateFormControl();
          } else {
            this.updateFileState(fileObj.id, {
              uploading: false,
              error: 'No response data received from server',
              progress: 0
            });
          }
        }
      },
      error: (error) => {
        const errorMessage = error.error?.message || error.message || 'Upload failed';
        this.updateFileState(fileObj.id, {
          uploading: false,
          error: errorMessage,
          progress: 0
        });

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to upload ${fileObj.name}`
        });
      }
    });
  }

  updateFileState(fileId: string, updates: Partial<FileWithProgress>): void {
    this.selectedFiles = this.selectedFiles.map(file =>
      file.id === fileId ? { ...file, ...updates } : file
    );
  }

  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getFileIconClass(type: string): string {
    type = type.toLowerCase();
    if (type.includes("excel") || type.includes("spreadsheetml")) {
      return "pi pi-file-excel text-green-600";
    } else if (type.includes("pdf")) {
      return "pi pi-file-pdf text-red-600";
    } else if (type.includes("image")) {
      return "pi pi-image text-blue-500";
    } else if (type.includes("zip") || type.includes("compressed")) {
      return "pi pi-folder text-yellow-600";
    } else if (type.includes("msword") || type.includes("wordprocessingml")) {
      return "pi pi-file-word text-blue-600";
    } else if (type.includes("text")) {
      return "pi pi-file text-gray-600";
    } else if (type.includes("audio")) {
      return "pi pi-volume-up text-purple-600";
    } else if (type.includes("video")) {
      return "pi pi-video text-indigo-600";
    } else {
      return "pi pi-file text-gray-400";
    }
  }

  readFiles(files: FileWithProgress[]): void {
    files.forEach((fileObj) => {
      if (fileObj.type.startsWith('image/') || fileObj.type.startsWith('video/') || fileObj.type.startsWith('audio/')) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            this.updateFileState(fileObj.id, { content: e.target.result as string });
          }
        };
        reader.readAsDataURL(fileObj.file);
      }
    });
  }

  // method map from selectedFiles to files
  

  updateFormControl(): void {
    console.log('updateFormControl called - index:', this.index);
    // Extract filePath from files
    const files = this.files
      .filter(f => f.Result && f.Result)
      .map(f => f.Result);
    
    // Return single object if multiple = false, array if multiple = true
    const value = this.multiple ? files : (files.length > 0 ? files[0] : null);
    this.control.setValue(value);
    console.log('updateFormControl completed - index:', this.index, 'value:', value);
  }

  get showError() {
    return this.control.invalid && this.control.dirty;
  }

  removeFile(fileId: string): void {
    const fileIndex = this.selectedFiles.findIndex(f => f.id === fileId);
    if (fileIndex !== -1) {
      this.selectedFiles.splice(fileIndex, 1);
      this.files.splice(fileIndex, 1);
      this.updateFormControl();
    }
  }

  retryUpload(fileId: string): void {
    const fileObj = this.selectedFiles.find(f => f.id === fileId);
    if (fileObj && fileObj.error) {
      this.uploadFile(fileObj);
    }
  }

  replaceFile(): void {
    if (!this.multiple && this.selectedFiles.length > 0) {
      // Remove the current file
      this.selectedFiles = [];
      this.files = [];
      this.updateFormControl();
      
      // Trigger file input click
      const fileInput = document.getElementById(`dropzone-file-${this.index}`) as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  downloadFile(fileId: string): void {
    const fileObj = this.selectedFiles.find(f => f.id === fileId);
    if (fileObj) {
      if (fileObj.content) {
        const blob = this.base64ToBlob(fileObj.content, fileObj.type);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileObj.name;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const url = URL.createObjectURL(fileObj.file);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileObj.name;
        link.click();
        URL.revokeObjectURL(url);
      }
    }
  }

  base64ToBlob(base64: string, type: string): Blob {
    const byteString = atob(base64.split(",")[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([uintArray], { type });
  }

  get overallProgress(): number {
    if (this.selectedFiles.length === 0) return 0;
    const totalProgress = this.selectedFiles.reduce((sum, file) => sum + file.progress, 0);
    return Math.round(totalProgress / this.selectedFiles.length);
  }

  get isUploading(): boolean {
    return this.selectedFiles.some(file => file.uploading);
  }

  get uploadStats() {
    const total = this.selectedFiles.length;
    const uploaded = this.selectedFiles.filter(f => f.uploaded).length;
    const failed = this.selectedFiles.filter(f => f.error).length;
    const uploading = this.selectedFiles.filter(f => f.uploading).length;

    return { total, uploaded, failed, uploading };
  }

  exportFiles() {
    this.files = this.selectedFiles.map((file) => {
      const existingFile = this.files.find((f) => f.file.name === file.name);
      return {
        file: {
          ...file,
          uploading: false,
          uploaded: false,
          error: undefined,
          progress: 0,
          description: file.description
        } as FileWithProgress,
        Result: existingFile?.Result
      };
    }).filter((item): item is { file: FileWithProgress; Result: Archived } => {
      return item.Result !== null;
    }) as { file: FileWithProgress; Result: Archived }[];

    this.loadingExport = true;
    // Return single object if multiple = false, array if multiple = true
    const value = this.multiple ? this.files : (this.files.length > 0 ? this.files[0] : null);
    this.onExportFiles.emit(value);
  }

  override ngOnDestroy(): void {
    this.selectedFiles = [];
    this.files = [];
    const value = this.multiple ? [] : null;
    this.control.setValue(value)
  }
}