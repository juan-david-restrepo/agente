package com.reporteloya.recuperar_password.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.reporteloya.recuperar_password.entity.Evidencia;
import com.reporteloya.recuperar_password.entity.Reporte;
import com.reporteloya.recuperar_password.repository.EvidenciaRepository;
import com.reporteloya.recuperar_password.repository.ReporteRepository;
import com.reporteloya.recuperar_password.service.FileStorageService;


@RestController
@RequestMapping("/api/reportes")
public class ReporteController {


    @Autowired
    private FileStorageService fileStorageService;

    private final EvidenciaRepository evidenciaRepository;
    private final ReporteRepository reporteRepository;

    public ReporteController(ReporteRepository reporteRepository,
                             EvidenciaRepository evidenciaRepository) {
        this.reporteRepository = reporteRepository;
        this.evidenciaRepository = evidenciaRepository;
    }

    @PostMapping(value = "/crear", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> crearReporte(
            @RequestParam String descripcion,
            @RequestParam String placa,
            @RequestParam String direccion,
            @RequestParam Double latitud,
            @RequestParam Double longitud,
            @RequestParam(required = false) String fechaIncidente,
            @RequestParam(required = false) String horaIncidente,
            @RequestParam("archivos") List<MultipartFile> archivos,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(403).body("No autenticado");
        }

        try {


            // ================================
            // 📝 CREAR REPORTE
            // ================================
            Reporte reporte = new Reporte();
            reporte.setDescripcion(descripcion);
            reporte.setPlaca(placa);
            reporte.setDireccion(direccion);
            reporte.setLatitud(latitud);
            reporte.setLongitud(longitud);

            if (fechaIncidente != null && !fechaIncidente.isEmpty()) {
                reporte.setFechaIncidente(LocalDate.parse(fechaIncidente));
            }

            if (horaIncidente != null && !horaIncidente.isEmpty()) {
                reporte.setHoraIncidente(LocalTime.parse(horaIncidente));
            }

            reporte.setEstado(Reporte.EstadoReporte.pendiente);
            reporte.setCreatedAt(LocalDateTime.now());
            reporte.setUpdatedAt(LocalDateTime.now());

            Reporte reporteGuardado = reporteRepository.save(reporte);

            // ================================
            // 📂 GUARDAR EVIDENCIAS
            // ================================
            for (MultipartFile archivo : archivos) {

                String url = fileStorageService
                        .guardarArchivo(archivo, reporteGuardado.getId());

                Evidencia evidencia = new Evidencia();
                evidencia.setTipo(archivo.getContentType());
                evidencia.setArchivo(url);
                evidencia.setReporte(reporteGuardado);

                evidenciaRepository.save(evidencia);
            }

            return ResponseEntity.ok(reporteGuardado);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body("Error al procesar el reporte: " + e.getMessage());
        }
    }
}