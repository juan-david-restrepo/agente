import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Nav } from '../../shared/nav/nav';
import { Footer } from '../../shared/footer/footer';
import { Avatar } from '../../service/avatar';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, Nav, Footer],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class Perfil implements OnInit {
  avatar = '';

  user: any = {
    name: '',
    lastname: '',
    email: '',
    phone: '',
    city: '',
    avatar: '',
  };

  constructor(
    private avatarService: Avatar,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    // 🔥 Validar sesión real contra backend
    this.authService.getCurrentUser().subscribe({
      next: (data) => {
        // Cargar datos reales del backend
        this.user = data;

        // Sincronizar estado global
        this.authService.setAuthenticated(true);
      },
      error: () => {
        // Si no hay sesión válida → redirigir
        this.authService.setAuthenticated(false);
        this.router.navigate(['/login']);
      },
    });

    // Suscripción al avatar
    this.avatarService.avatar$.subscribe((avatar) => {
      this.avatar = avatar;
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.user.avatar = String(e.target?.result);
    };
    reader.readAsDataURL(file);
  }

  saveProfile() {
    // Aquí idealmente deberías enviar al backend
    console.log('Perfil actualizado:', this.user);
    alert('Cambios guardados correctamente');
  }
}
