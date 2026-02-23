export interface Tarea { 
  id?: number;
  placaAgente: string;
  fecha: string;
  hora: string;
  descripcion: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
}
