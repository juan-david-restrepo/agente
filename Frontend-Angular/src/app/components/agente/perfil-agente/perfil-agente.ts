import { Component, Input } from '@angular/core';
import { SidebarAgente } from '../sidebar-agente/sidebar-agente';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil-agente',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './perfil-agente.html',
  styleUrl: './perfil-agente.css',
})
export class PerfilAgente {

  @Input() agente!: {
 nombre:string;
 placa:string;
 foto:string;
 cedula:string;
 celular:string;
 correo:string;
 rango:string;
 ciudad:string;
};
}
