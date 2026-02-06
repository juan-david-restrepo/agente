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

  isSidebarOpen = false;
  isModalOpen = false;
  currentAvatar = 'assets/images/images (3).png';
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private avatarService: Avatar
  ) {}

  ngOnInit() {

    // Estado de login
    this.authService.authState$.subscribe(state => {
      this.isLoggedIn = state;
    });

    this.isLoggedIn = !!localStorage.getItem('token');

    // 🔥 ESCUCHAR AVATAR GLOBAL
    this.avatarService.avatar$.subscribe(avatar => {
      this.currentAvatar = avatar;
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

  // 👉 CUANDO SE SELECCIONA AVATAR EN EL NAV
  onAvatarSelected(avatar: string) {
    this.avatarService.setAvatar(avatar);
    this.isModalOpen = false;
  }

  logout() {
    this.authService.logout();
  }
}
