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
import { AuthService } from '../../service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, Nav, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  formLogin: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // ✅ REACTIVAMOS ROL
    this.formLogin = this.fb.group({
      rol: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.formLogin.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos correctamente.',
      });
      return;
    }

    const { rol, email, password } = this.formLogin.value;

    this.authService.login(email, password).subscribe({
      next: (resp) => {
        console.log('Respuesta del backend:', resp);

        if (resp.token) {
          localStorage.setItem('token', resp.token);
          this.authService.setSession(resp.token);
        }

        if (resp.userId) {
          localStorage.setItem('userId', resp.userId);
        }


        // Guardar sesión
       // localStorage.setItem('token', resp.token);
        localStorage.setItem('userId', resp.userId);
        localStorage.setItem('email', resp.email);
        localStorage.setItem('role', resp.role);

        Swal.fire({
          icon: 'success',
          title: 'Bienvenido!',
          text: 'Inicio de sesión exitoso',
          timer: 1500,
          showConfirmButton: false,
        });

        // 👉 REDIRECCIÓN SEGÚN ROL
        if (rol === 'ciudadano') {
          this.router.navigate(['/home']);
        } else if (rol === 'agente') {
          this.router.navigate(['/agente']);
        } else if (rol === 'administrador') {
          this.router.navigate(['/admin']);
        }
      },

      error: (err) => {
        console.error(err);

        Swal.fire({
          icon: 'error',
          title: 'Error al iniciar sesión',
          text: err.error || 'Credenciales incorrectas',
        });
      },
    });
  }
}
