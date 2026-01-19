import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { inject } from '@angular/core';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Services
import { MessageService, ConfirmationService } from 'primeng/api';
import { HeroLayoutsService } from '../../../services/hero-layouts.service';
import { IHeroLayout } from '../../../interfaces/hero-layout.interface';
import { TooltipModule } from 'primeng/tooltip';
import { UploadFilesService } from '../../../shared/components/fields/upload-files/upload-files.service';
import { environment } from '../../../../environments/environment';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-hero-layouts-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    InputTextModule,
    ConfirmDialogModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    ProgressSpinnerModule,
    TranslateModule,
    TooltipModule,
    DialogModule
  ],
  templateUrl: './hero-layouts-list.component.html',
  styleUrls: ['./hero-layouts-list.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class HeroLayoutsListComponent implements OnInit {
  heroLayouts = signal<IHeroLayout[]>([]);
  loading = signal<boolean>(true);
  removingImage = false;
  translate = inject(TranslateService);

  // Image viewer dialog
  imageDialogVisible = false;
  selectedImage: any = null;

  constructor(
    private heroLayoutsService: HeroLayoutsService,
    private uploadFilesService: UploadFilesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHeroLayouts();
  }

  loadHeroLayouts(): void {
    this.loading.set(true);
    this.heroLayoutsService.getHeroLayouts().subscribe({
      next: (response) => {
        this.heroLayouts.set(response.data || []);
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: this.translate.instant('heroLayout.failedToLoad')
        });
        this.loading.set(false);
      }
    });
  }

  openNew(): void {
    this.router.navigate(['/hero-layouts/new']);
  }

  editHeroLayout(heroLayout: IHeroLayout): void {
    if (heroLayout._id) {
      this.router.navigate(['/hero-layouts', heroLayout._id]);
    }
  }

  deleteHeroLayout(heroLayout: IHeroLayout): void {
    this.confirmationService.confirm({
      message: this.translate.instant('heroLayout.confirmDelete', { name: heroLayout.name }),
      header: this.translate.instant('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (heroLayout._id) {
          this.heroLayoutsService.deleteHeroLayout(heroLayout._id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('common.success'),
                detail: this.translate.instant('heroLayout.deletedSuccessfully')
              });
              this.loadHeroLayouts();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('common.error'),
                detail: this.translate.instant('heroLayout.failedToDelete')
              });
            }
          });
        }
      }
    });
  }

  toggleActive(heroLayout: IHeroLayout): void {
    if (heroLayout._id) {
      this.heroLayoutsService.toggleActiveStatus(heroLayout._id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('common.success'),
            detail: this.translate.instant('heroLayout.statusUpdatedSuccessfully')
          });
          this.loadHeroLayouts();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: this.translate.instant('heroLayout.failedToUpdateStatus')
          });
        }
      });
    }
  }

  getStatusLabel(isActive: boolean): string {
    return isActive
      ? this.translate.instant('common.active')
      : this.translate.instant('common.inactive');
  }

  getImageUrl(filePath: string): string {
    return `${environment.baseUrl}/${filePath}`;
  }

  viewImage(image: any): void {
    this.selectedImage = image;
    this.imageDialogVisible = true;
  }

  removeImageFromItem(heroLayout: IHeroLayout, itemIndex: number): void {
    console.log('Removing image from hero layout:', heroLayout._id, 'item index:', itemIndex);

    this.confirmationService.confirm({
      message: this.translate.instant('heroLayout.confirmRemoveImage'),
      header: this.translate.instant('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.removingImage = true;

        if (!heroLayout._id) {
          console.error('Hero layout ID is missing');
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: 'Hero layout ID is missing'
          });
          this.removingImage = false;
          return;
        }

        if (!heroLayout.items || !heroLayout.items[itemIndex] || !heroLayout.items[itemIndex].image) {
          console.error('Image not found in hero layout item');
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: 'Image not found'
          });
          this.removingImage = false;
          return;
        }

        const image = heroLayout.items[itemIndex].image!;
        console.log('Image to delete:', image);

        // Call API to delete the file from filesystem (if it has id and filePath)
        if ((image as any).id && image.filePath) {
          console.log('Deleting file from server:', (image as any).id, image.filePath);

          this.uploadFilesService.DeleteFile(
            (image as any).id,
            image.filePath,
            (image as any).storageLocation || 'local'
          ).subscribe({
            next: (response) => {
              console.log('File deleted from server successfully:', response);
              this.updateHeroLayoutItem(heroLayout, itemIndex);
            },
            error: (error) => {
              console.error('Failed to delete file from server:', error);
              // Still proceed to remove from hero layout
              this.updateHeroLayoutItem(heroLayout, itemIndex);
            }
          });
        } else {
          console.log('No file to delete from server, updating layout only');
          // No file to delete from server, just update the layout
          this.updateHeroLayoutItem(heroLayout, itemIndex);
        }
      }
    });
  }

  private updateHeroLayoutItem(heroLayout: IHeroLayout, itemIndex: number): void {
    console.log('Updating hero layout item, heroLayout ID:', heroLayout._id, 'itemIndex:', itemIndex);

    // Update the hero layout by removing the image reference
    const updatedItems = [...(heroLayout.items || [])];
    console.log('Original item:', updatedItems[itemIndex]);

    updatedItems[itemIndex] = { ...updatedItems[itemIndex], image: undefined };
    console.log('Updated item:', updatedItems[itemIndex]);

    const updatedHeroLayout = {
      ...heroLayout,
      items: updatedItems
    };

    console.log('Updated hero layout:', updatedHeroLayout);

    // Save the updated hero layout
    this.heroLayoutsService.updateHeroLayout(heroLayout._id!, updatedHeroLayout).subscribe({
      next: (response) => {
        console.log('Hero layout updated successfully:', response);
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('common.success'),
          detail: this.translate.instant('heroLayout.imageRemovedSuccessfully')
        });
        this.loadHeroLayouts(); // Reload to show updated data
        this.removingImage = false;
      },
      error: (error) => {
        console.error('Failed to update hero layout:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: this.translate.instant('heroLayout.failedToRemoveImage')
        });
        this.removingImage = false;
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onGlobalFilter(table: any, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

}


