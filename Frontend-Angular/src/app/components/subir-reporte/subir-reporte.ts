import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import * as L from 'leaflet';
import Tesseract from 'tesseract.js';
import { Nav } from '../../shared/nav/nav';

interface Incidente {
  nombre: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
  requierePlaca: boolean;
}

@Component({
  selector: 'app-subir-reporte',
  standalone: true,
  imports: [FormsModule, Nav, CommonModule],
  templateUrl: './subir-reporte.html',
  styleUrls: ['./subir-reporte.css'],
  encapsulation: ViewEncapsulation.None
})
export class SubirReporteComponent implements OnInit {

  // =============================
  // CONFIGURACIÓN
  // =============================

  private readonly MAX_FILES = 5;
  private readonly MAX_SIZE_MB = 5;
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'video/mp4'];
  private readonly PLACA_REGEX = /^[A-Z]{3}\d{3}$/;

  // =============================
  // ESTADO DEL FORMULARIO
  // =============================

  fileList: File[] = [];
  private previewUrls: string[] = [];

  placa = '';
  descripcion = '';
  fecha = '';
  hora = '';
  direccion = '';
  coordenadas = '';

  tipoSeleccionado = '';
  detalleOtroIncidente = '';

  prioridadInterna: 'BAJA' | 'MEDIA' | 'ALTA' | '' = '';

  mostrarCampoOtros = false;
  requierePlacaActual = false;
  placaOpcional = false;

  isSubmitting = false;

  // =============================
  // INCIDENTES DISPONIBLES
  // =============================

  incidentes: Incidente[] = [
    { nombre: 'Accidente de tránsito', prioridad: 'ALTA', requierePlaca: true },
    { nombre: 'Vehículo mal estacionado', prioridad: 'MEDIA', requierePlaca: true },
    { nombre: 'Semáforo dañado', prioridad: 'ALTA', requierePlaca: false },
    { nombre: 'Conducción peligrosa', prioridad: 'ALTA', requierePlaca: true },
    { nombre: 'Otros', prioridad: 'BAJA', requierePlaca: false }
  ];

  private map: any;
  private marker: any;

  ngOnInit(): void {}

  // =============================
  // VALIDACIONES
  // =============================

  private validarPlaca(): boolean {

    // Si no es obligatoria y está vacía → válido
    if (!this.requierePlacaActual && !this.placa) return true;

    // Si es obligatoria y está vacía → inválido
    if (this.requierePlacaActual && !this.placa) return false;

    // Si el usuario escribió algo → validar formato
    if (this.placa) {
      return this.PLACA_REGEX.test(this.placa.toUpperCase());
    }

    return true;
  }

  private validarFechaHora(): boolean {

    if (!this.fecha || !this.hora) return false;

    const ahora = new Date();
    const seleccionada = new Date(`${this.fecha}T${this.hora}`);

    return seleccionada <= ahora;
  }

  formularioValido(): boolean {

    const tipoFinal =
      this.tipoSeleccionado === 'Otros'
        ? this.detalleOtroIncidente?.trim()
        : this.tipoSeleccionado;

    return !!(
      tipoFinal &&
      this.descripcion?.trim().length >= 10 &&
      this.validarFechaHora() &&
      this.validarPlaca()
    );
  }

  // =============================
  // SELECCIÓN DE INCIDENTE
  // =============================

  seleccionarIncidente(incidente: Incidente) {

    this.tipoSeleccionado = incidente.nombre;
    this.prioridadInterna = incidente.prioridad;

    this.mostrarCampoOtros = incidente.nombre === 'Otros';
    this.requierePlacaActual = incidente.requierePlaca;
    this.placaOpcional = incidente.nombre === 'Otros';

    // Si no aplica placa → limpiar
    if (!this.requierePlacaActual && !this.placaOpcional) {
      this.placa = '';
    }

    if (!this.mostrarCampoOtros) {
      this.detalleOtroIncidente = '';
    }
  }

  // =============================
  // MANEJO DE ARCHIVOS
  // =============================

  onFileChange(event: any) {

    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const nuevos = Array.from(input.files);

    for (const file of nuevos) {

      if (!this.ALLOWED_TYPES.includes(file.type)) {
        Swal.fire('Archivo no permitido', 'Solo JPG, PNG o MP4.', 'error');
        continue;
      }

      if (file.size > this.MAX_SIZE_MB * 1024 * 1024) {
        Swal.fire('Archivo muy grande', 'Máximo 5MB por archivo.', 'error');
        continue;
      }

      if (this.fileList.length >= this.MAX_FILES) {
        Swal.fire('Límite alcanzado', 'Máximo 5 archivos.', 'warning');
        break;
      }

      this.fileList.push(file);
    }

    if (this.requierePlacaActual) {
      this.detectarPlaca();
    }
  }

  removeFile(index: number) {
    this.fileList.splice(index, 1);
  }

  getPreviewUrl(file: File): string {
    const url = URL.createObjectURL(file);
    this.previewUrls.push(url);
    return url;
  }

  private limpiarPreviewUrls() {
    this.previewUrls.forEach(url => URL.revokeObjectURL(url));
    this.previewUrls = [];
  }

  private detectarPlaca() {

    const imagen = this.fileList.find(f => f.type.startsWith('image'));
    if (!imagen) return;

    const imageUrl = URL.createObjectURL(imagen);

    Tesseract.recognize(imageUrl, 'eng')
      .then(({ data }: any) => {

        const matches = data.text.match(/[A-Z]{3}[- ]?\d{3}/);

        if (matches?.[0]) {
          this.placa = matches[0].replace(/[- ]/, '').toUpperCase();
        }
      })
      .catch(() => {
        console.warn('Error al procesar OCR');
      });
  }

  // =============================
  // UBICACIÓN
  // =============================

  obtenerUbicacion() {

    if (!navigator.geolocation) {
      Swal.fire('Error', 'Geolocalización no disponible.', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        this.coordenadas = `${lat}, ${lng}`;

        if (!this.map) {
          this.map = L.map('map').setView([lat, lng], 16);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
            .addTo(this.map);
        }

        if (this.marker) {
          this.marker.setLatLng([lat, lng]);
        } else {
          this.marker = L.marker([lat, lng]).addTo(this.map);
        }

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );

        const data = await res.json();
        this.direccion = data.display_name || '';
      },
      () => {
        Swal.fire('Error', 'No se pudo obtener la ubicación.', 'error');
      }
    );
  }

  // =============================
  // ENVÍO
  // =============================

  async enviarReporte() {

    if (!this.formularioValido()) {
      await Swal.fire('Formulario incompleto', 'Revisa los campos obligatorios.', 'warning');
      return;
    }

    this.isSubmitting = true;

    try {

      await new Promise(resolve => setTimeout(resolve, 1500));

      await Swal.fire({
        icon: 'success',
        title: 'Reporte enviado correctamente'
      });

      this.resetFormulario();

    } catch (error) {

      await Swal.fire({
        icon: 'error',
        title: 'Error inesperado'
      });

    } finally {
      this.isSubmitting = false;
    }
  }

  // =============================
  // RESET
  // =============================

  resetFormulario() {

    this.limpiarPreviewUrls();

    this.fileList = [];
    this.placa = '';
    this.descripcion = '';
    this.fecha = '';
    this.hora = '';
    this.direccion = '';
    this.coordenadas = '';
    this.tipoSeleccionado = '';
    this.prioridadInterna = '';
    this.mostrarCampoOtros = false;
    this.detalleOtroIncidente = '';
    this.requierePlacaActual = false;
    this.placaOpcional = false;
  }
}