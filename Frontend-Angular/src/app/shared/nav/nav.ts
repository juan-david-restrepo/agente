import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../components/modal/modal.component';
import { AuthService } from '../../service/auth.service';
import { Avatar } from '../../service/avatar';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterModule, CommonModule, ModalComponent],
  templateUrl: './nav.html',
  styleUrls: ['./nav.css'],
})
export class Nav implements OnInit {

   currentYear = new Date().getFullYear();

  isSidebarOpen = false;
  isModalOpen = false;
  currentAvatar = 'assets/images/images (3).png';
  isLoggedIn = false;

  private userId: string | null = null; // ID del usuario logueado

  constructor(
    private authService: AuthService,
    private avatarService: Avatar
  ) {}

  ngOnInit() {

    // Estado de login
    this.authService.authState$.subscribe(state => {
      this.isLoggedIn = state;

      if (state) {
        // Obtener el userId desde localStorage en lugar de depender solo de AuthService
        this.userId = localStorage.getItem('userId');

        if (this.userId) {
          // Cargar el avatar del usuario específico desde localStorage
          this.avatarService.loadAvatarForUser(this.userId);
        }
      }
    });

    this.isLoggedIn = !!localStorage.getItem('token');

    // Suscribirse a cambios de avatar global
    this.avatarService.avatar$.subscribe(avatar => {
      this.currentAvatar = avatar; // Se actualiza automáticamente en Nav
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  openModal() {
    this.isModalOpen = true;
  }

  // Cuando se selecciona un avatar en el Nav
  onAvatarSelected(avatar: string) {
    if (this.userId) {
      // Guardar avatar para el usuario específico en localStorage
      this.avatarService.setAvatarForUser(this.userId, avatar);
    }
    this.isModalOpen = false;
  }

  logout() {
    this.authService.logout();
    // No resetear el avatar para mantener persistencia por usuario
  }
}