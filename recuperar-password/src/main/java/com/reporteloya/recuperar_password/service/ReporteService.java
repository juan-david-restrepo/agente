package com.reporteloya.recuperar_password.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.reporteloya.recuperar_password.entity.Reporte;
import com.reporteloya.recuperar_password.entity.Agentes;
import com.reporteloya.recuperar_password.entity.Evidencia;
import com.reporteloya.recuperar_password.entity.Prioridad;

import com.reporteloya.recuperar_password.repository.ReporteRepository;
import com.reporteloya.recuperar_password.repository.AgenteRepository;
import com.reporteloya.recuperar_password.repository.EvidenciaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.io.IOException;

@Service
public class ReporteService {

    private final AgenteRepository agenteRepository;
    private final ReporteRepository reporteRepository;
    private final EvidenciaRepository evidenciaRepository;
    private final FileStorageService fileStorageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ImageValidationService imageValidationService;

    public ReporteService(
            ReporteRepository reporteRepository,
            AgenteRepository agenteRepository,
            EvidenciaRepository evidenciaRepository,
            FileStorageService fileStorageService,
            SimpMessagingTemplate messagingTemplate,
            ImageValidationService imageValidationService) {

        this.reporteRepository = reporteRepository;
        this.agenteRepository = agenteRepository;
        this.evidenciaRepository = evidenciaRepository;
        this.fileStorageService = fileStorageService;
        this.messagingTemplate = messagingTemplate;
        this.imageValidationService = imageValidationService;
    }

    // ================================
    // CREAR REPORTE
    // ================================
    public Reporte crearReporte(
            String descripcion,
            String direccion,
            Double latitud,
            Double longitud,
            String placa,
            String fechaIncidente,
            String horaIncidente,
            String tipoInfraccion,
            List<MultipartFile> archivos) {

        // ====================================
        // 🔎 VALIDACIÓN CON GOOGLE VISION
        // ====================================
        boolean imagenValida = false;

        if (archivos != null && !archivos.isEmpty()) {
            for (MultipartFile archivo : archivos) {

                if (archivo.getContentType() != null &&
                        archivo.getContentType().startsWith("image")) {

                    boolean valida = imageValidationService.esImagenDeTransito(archivo);

                    if (valida) {
                        imagenValida = true;
                        break; // con una válida basta
                    }
                }
            }
        }

        if (!imagenValida) {
            throw new RuntimeException("La imagen no parece estar relacionada con tránsito.");
        }

        // ====================================
        // CREACIÓN DEL REPORTE
        // ====================================
        Reporte reporte = new Reporte();

        reporte.setDescripcion(descripcion);
        reporte.setDireccion(direccion);
        reporte.setLatitud(latitud);
        reporte.setLongitud(longitud);
        reporte.setEstado("PENDIENTE");

        reporte.setTipoInfraccion(tipoInfraccion);
        reporte.setPrioridad(obtenerPrioridadPorTipo(tipoInfraccion));

        if (placa != null && !placa.isBlank()) {
            reporte.setPlaca(placa.trim().toUpperCase());
        }

        if (fechaIncidente != null && !fechaIncidente.isBlank()) {
            try {
                reporte.setFechaIncidente(LocalDate.parse(fechaIncidente.trim()));
            } catch (Exception e) {
                throw new RuntimeException("Formato de fecha inválido. Debe ser yyyy-MM-dd");
            }
        }

        if (horaIncidente != null && !horaIncidente.isBlank()) {
            try {
                reporte.setHoraIncidente(LocalTime.parse(horaIncidente.trim()));
            } catch (Exception e) {
                throw new RuntimeException("Formato de hora inválido. Debe ser HH:mm");
            }
        }

        // Guardar reporte
        Reporte guardado = reporteRepository.save(reporte);

        // Guardar evidencias
        guardarEvidencias(archivos, guardado);

        // 🔥 Notificaciones en tiempo real
        messagingTemplate.convertAndSend("/topic/admins", guardado);
        messagingTemplate.convertAndSend("/topic/agents", guardado);

        return guardado;
    }

    // ================================
    // GUARDAR EVIDENCIAS
    // ================================
    private void guardarEvidencias(List<MultipartFile> archivos, Reporte reporte) {

        if (archivos == null || archivos.isEmpty())
            return;

        for (MultipartFile archivo : archivos) {
            try {
                String url = fileStorageService.guardarArchivo(archivo, reporte.getId());

                Evidencia evidencia = new Evidencia();
                evidencia.setTipo(archivo.getContentType());
                evidencia.setArchivo(url);
                evidencia.setReporte(reporte);

                evidenciaRepository.save(evidencia);

            } catch (IOException e) {
                throw new RuntimeException("Error al guardar archivo: " + e.getMessage(), e);
            }
        }
    }

    // ================================
    // PRIORIDAD AUTOMÁTICA
    // ================================
    private Prioridad obtenerPrioridadPorTipo(String tipo) {

        if (tipo == null)
            return Prioridad.BAJA;

        return switch (tipo) {

            case "Accidente de tránsito",
                 "Semáforo dañado",
                 "Conducción peligrosa" ->
                Prioridad.ALTA;

            case "Vehículo mal estacionado",
                 "Invasión de carril" ->
                Prioridad.MEDIA;

            default ->
                Prioridad.BAJA;
        };
    }

    // ================================
    // OBTENER PENDIENTES
    // ================================
    public List<Reporte> obtenerPendientes() {
        return reporteRepository.findByEstado("PENDIENTE");
    }

    // ================================
    // AGENTE TOMA REPORTE
    // ================================
    public Reporte tomarReporte(Long reporteId, String placaAgente) {

        Reporte reporte = reporteRepository.findById(reporteId)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));

        if (!"PENDIENTE".equals(reporte.getEstado())) {
            throw new RuntimeException("El reporte ya fue tomado");
        }

        Agentes agente = agenteRepository.findByPlacaIgnoreCase(placaAgente)
                .orElseThrow(() -> new RuntimeException("Agente no encontrado"));

        reporte.setAgente(agente);
        reporte.setEstado("EN_PROCESO");

        Reporte actualizado = reporteRepository.save(reporte);

        messagingTemplate.convertAndSend("/topic/reportes-update", actualizado);

        return actualizado;
    }

    public Reporte finalizarReporte(Long reporteId, String placaAgente) {

        Reporte reporte = reporteRepository.findById(reporteId)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));

        if (!"EN_PROCESO".equals(reporte.getEstado())) {
            throw new RuntimeException("El reporte no está en proceso");
        }

        reporte.setEstado("FINALIZADO");

        Reporte actualizado = reporteRepository.save(reporte);

        messagingTemplate.convertAndSend("/topic/reportes-update", actualizado);

        return actualizado;
    }

    public List<Reporte> obtenerReportesParaAgente(String placaAgente) {

        List<Reporte> pendientes = reporteRepository.findByEstado("PENDIENTE");

        List<Reporte> enProceso = reporteRepository
                .findByAgentePlacaIgnoreCaseAndEstado(placaAgente, "EN_PROCESO");

        pendientes.addAll(enProceso);

        return pendientes;
    }

    public List<Reporte> obtenerHistorialAgente(String placaAgente) {

        return reporteRepository
                .findByAgentePlacaIgnoreCaseAndEstado(placaAgente, "FINALIZADO");
    }
}