export interface Agente {
  id: number;
  placa: string;
  nombre: string;
  estado: 'DISPONIBLE' | 'OCUPADO' | 'FUERA DE SERVICIO';
  telefono: string;
  documento: string; // 👈 AÑADIDO
  foto?: string;
}
