import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../components/modal/modal.component';
import { AuthService } from '../../service/auth.service';
import { Avatar } from '../../service/avatar';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterModule, CommonModule, ModalComponent],
  templateUrl: './nav.html',
  styleUrls: ['./nav.css'],
})
export class Nav implements OnInit, OnDestroy {
  isSidebarOpen = false;
  isModalOpen = false;
  currentAvatar = 'assets/images/images (3).png';
  isLoggedIn = false;

  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private avatarService: Avatar,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // 🔐 Escuchar estado global de autenticación
    const authSub = this.authService.authState$.subscribe((state) => {
      this.isLoggedIn = state;

      // 🔥 Si el usuario deja de estar logueado, cerrar sidebar automáticamente
      if (!state) {
        this.isSidebarOpen = false;
      }
    });

    // 🖼 Escuchar cambios globales de avatar
    const avatarSub = this.avatarService.avatar$.subscribe((avatar) => {
      this.currentAvatar = avatar;
    });

    // 🔄 Cerrar sidebar en cada navegación
    const routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isSidebarOpen = false;
      });

    this.subscriptions.add(authSub);
    this.subscriptions.add(avatarSub);
    this.subscriptions.add(routerSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  onAvatarSelected(avatar: string): void {
    this.avatarService.setAvatar(avatar);
    this.isModalOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: () => {
        this.router.navigate(['/home']);
      },
    });
  }
}
