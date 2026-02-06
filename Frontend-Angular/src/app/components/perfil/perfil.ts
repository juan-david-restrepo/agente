import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Nav } from '../../shared/nav/nav';
import { Footer } from '../../shared/footer/footer';
import { Avatar } from '../../service/avatar';


@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, Nav, Footer, ],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class Perfil implements OnInit {

    avatar = '';

  constructor(private avatarService: Avatar) {}

  user = {
    name: '',
    lastname: '',
    email: 'miguel@example.com',
    phone: '',
    city: 'Armenia',
    avatar: 'assets/images/images (3).png'
  };

  ngOnInit() {
    // 👉 Cargar datos guardados si existen
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      this.user = JSON.parse(saved);
    }

      this.avatarService.avatar$.subscribe(avatar => {
      this.avatar = avatar;
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      this.user.avatar = String(e.target?.result);
      this.saveProfile(); // guardar la imagen
    };
    reader.readAsDataURL(file);
  }

  saveProfile() {
    localStorage.setItem('userProfile', JSON.stringify(this.user));
    alert('Cambios guardados correctamente');
  }
}
