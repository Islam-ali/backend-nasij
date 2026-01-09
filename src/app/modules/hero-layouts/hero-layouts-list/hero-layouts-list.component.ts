import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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
  ],
  templateUrl: './hero-layouts-list.component.html',
  styleUrls: ['./hero-layouts-list.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class HeroLayoutsListComponent implements OnInit {
  heroLayouts = signal<IHeroLayout[]>([]);
  loading = signal<boolean>(true);

  constructor(
    private heroLayoutsService: HeroLayoutsService,
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
          summary: 'Error',
          detail: 'Failed to load hero layouts'
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
      message: `Are you sure you want to delete "${heroLayout.name}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (heroLayout._id) {
          this.heroLayoutsService.deleteHeroLayout(heroLayout._id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Hero layout deleted successfully'
              });
              this.loadHeroLayouts();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete hero layout'
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
            summary: 'Success',
            detail: 'Status updated successfully'
          });
          this.loadHeroLayouts();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update status'
          });
        }
      });
    }
  }

  onGlobalFilter(table: any, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

}


