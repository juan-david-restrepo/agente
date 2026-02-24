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
    private authService: AuthService,
  ) {
    this.formLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rol: ['']
    });
  }

  onSubmit(): void {
    if (this.formLogin.invalid) {
      Swal.fire('Formulario incompleto', 'Completa los campos', 'warning');
      return;
    }

    const { email, password } = this.formLogin.value;

    this.authService.login(email, password).subscribe({
      next: (resp) => {
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          timer: 1200,
          showConfirmButton: false,
        });
        this.authService.setAuthenticated(true);
        this.authService.setLoggedIn(true);

        // 🔁 REDIRECCIÓN SEGÚN ROL (BACKEND)
        switch (resp.role) {
          case 'ADMIN':
            this.router.navigate(['/admin']);
            break;
          case 'AGENTE':
            this.router.navigate(['/agente']);
            break;
          default:
            this.router.navigate(['/home']);
            break;
        }
      },

      error: () => {
        Swal.fire('Error', 'Credenciales incorrectas', 'error');
      },
    });
  }
}
