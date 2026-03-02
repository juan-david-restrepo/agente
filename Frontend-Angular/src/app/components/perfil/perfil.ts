import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Nav } from '../../shared/nav/nav';
import { Footer } from '../../shared/footer/footer';
import { Avatar } from '../../service/avatar';
import { UserService, Usuario } from '../../service/user.service';
import { ModalComponent } from '../../components/modal/modal.component';
import Swal from 'sweetalert2';
import { AuthService } from '../../service/auth.service'; // Necesario para obtener userId

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, Nav, Footer, ModalComponent],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class Perfil implements OnInit {
  totalReportes: number = 0;
  avatar = '';
  selectedBackground = '#1e3a8a';
  isEditing = false;

  // Control del modal de avatar
  isModalOpen = false;
  private userId: string | null = null; // ID del usuario logueado

  constructor(
    private avatarService: Avatar,
    private userService: UserService,
    private authService: AuthService // Para obtener userId
  ) {}

  // Abrir modal de avatar
  openAvatarModal() { 
    this.isModalOpen = true; 
  }

  // Recibir avatar seleccionado desde el modal
  onAvatarSelected(newAvatar: string) {
    if (this.userId) {
      // Guardar avatar para el usuario específico en localStorage
      this.avatarService.setAvatarForUser(this.userId, newAvatar);
    }
    this.isModalOpen = false; // Cierra modal
  }

  // Cambiar avatar desde input tipo file (opcional)
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if(file && this.userId) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Guardar avatar para el usuario específico en localStorage
        this.avatarService.setAvatarForUser(this.userId!, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  // Datos del usuario
  user = {
    name: '',
    lastname: '',
    email: '',
    password: '',
    password2: ''
  };

  ngOnInit() {
    // Obtener userId del usuario logueado desde localStorage
    this.userId = localStorage.getItem('userId');

    // Cargar avatar del usuario desde localStorage
    if (this.userId) {
      this.avatarService.loadAvatarForUser(this.userId);
    }

    // Suscribirse a cambios de avatar global
    this.avatarService.avatar$.subscribe(avatar => this.avatar = avatar);

    this.userService.getTotalReportes().subscribe({
      next: (res) => this.totalReportes = res.total_reportes,
      error: (err) => console.error('Error al obtener reportes:', err)
    });

    // Cargar datos del backend con JWT
    this.userService.getProfile().subscribe({
      next: (user: Usuario) => {
        const parts = user.nombreCompleto.split(' ');
        this.user.name = parts[0];
        this.user.lastname = parts.length > 1 ? parts.slice(1).join(' ') : '';
        this.user.email = user.email || '';
      },
      error: err => {
        console.error('Error al cargar perfil:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el perfil. Revisa que tu sesión esté activa.'
        });
      }
    });
  }

  // Toggle edición de perfil
  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  // Guardar cambios de perfil
  saveProfile() {
    if (this.user.password && this.user.password !== this.user.password2) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }

    const updatedUser: Usuario = {
      nombreCompleto: `${this.user.name} ${this.user.lastname}`,
      email: this.user.email,
      password: this.user.password || null
    };

    this.userService.updateProfile(updatedUser).subscribe({
      next: res => {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Cambios guardados correctamente'
        });
        this.user.password = '';
        this.user.password2 = '';
      },
      error: err => {
        console.error('Error al guardar perfil:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al guardar los cambios'
        });
      }
    });
  }
}