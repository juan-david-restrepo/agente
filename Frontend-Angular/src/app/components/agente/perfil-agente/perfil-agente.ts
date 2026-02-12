import { Component, EventEmitter, Input, Output } from '@angular/core';
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
 numeroDocumento:string;
 rango:string;
 ciudad:string; 
};

  @Input() estadoAgente!: 'LIBRE'|'OCUPADO'|'FUERA_SERVICIO';

  @Output() estadoChange = new EventEmitter<any>();


  cambiarEstado(event: any){
    this.estadoChange.emit(event);
  }


cambiarFoto(event: any) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    this.agente.foto = reader.result as string;
  };

  reader.readAsDataURL(file);
}


}
