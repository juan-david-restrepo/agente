import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Nav } from '../../shared/nav/nav';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RouterLink, CommonModule, Nav, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css'],
})
export class Registro {
  registroForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.registroForm = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.maxLength(60),
          Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/),
        ],
      ],
      correo: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(80)],
      ],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      tipoDocumento: ['', Validators.required],
      numeroDocumento: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+$/),
          Validators.minLength(6),
          Validators.maxLength(10),
        ],
      ],
      rol: ['Ciudadano', Validators.required],
    });
  }

  /** Redirección según rol */
  private redirigirSegunRol(rol?: string) {
    if (!rol) {
      this.router.navigate(['/home']);
      return;
    }

    switch (rol.toUpperCase()) {
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      case 'AGENTE':
        this.router.navigate(['/agente']);
        break;
      case 'CIUDADANO':
      default:
        this.router.navigate(['/home']);
        break;
    }
  }

  /** Enviar formulario */
  onSubmit(): void {
    if (this.registroForm.invalid) {
      if (this.registroForm.get('numeroDocumento')?.invalid) {
        Swal.fire(
          'Documento inválido',
          'La cédula debe tener solo números y entre 6 y 10 dígitos.',
          'warning',
        );
        return;
      }

      if (this.registroForm.get('correo')?.invalid) {
        Swal.fire(
          'Correo inválido',
          'Ingresa un correo electrónico válido.',
          'warning',
        );
        return;
      }

      if (this.registroForm.get('nombre')?.invalid) {
        Swal.fire(
          'Nombre inválido',
          'El nombre no debe superar los 60 caracteres ni contener números.',
          'warning',
        );
        return;
      }

      Swal.fire(
        'Formulario inválido',
        'Revisa los campos del formulario.',
        'warning',
      );
      return;
    }

    const data = {
      nombreCompleto: this.registroForm.value.nombre,
      email: this.registroForm.value.correo,
      password: this.registroForm.value.contrasena,
      tipoDocumento: this.registroForm.value.tipoDocumento,
      numeroDocumento: this.registroForm.value.numeroDocumento,
      rol: this.registroForm.value.rol,
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.authService.getCurrentUser().subscribe((user) => {
          this.authService.setLoggedIn(true);

          console.log('USUARIO ACTUAL:', user);

          this.redirigirSegunRol(user.role);
        });
      },

      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: err.error || 'Hubo un problema durante el registro.',
        });
      },
    });
  }
}
