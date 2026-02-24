package com.reporteloya.recuperar_password.controller;

import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;

import com.reporteloya.recuperar_password.entity.Evidencia;
import com.reporteloya.recuperar_password.entity.Reporte;
import com.reporteloya.recuperar_password.repository.ReporteRepository;
import com.reporteloya.recuperar_password.repository.EvidenciaRepository;
import com.reporteloya.recuperar_password.service.FileStorageService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    @Autowired
    private FileStorageService fileStorageService;

    private final EvidenciaRepository EvidenciaRepository;
    private final ReporteRepository reporteRepository;

    public ReporteController(ReporteRepository reporteRepository, EvidenciaRepository evidenciaRepository) {
        this.reporteRepository = reporteRepository;
        this.EvidenciaRepository = evidenciaRepository;
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

            Reporte reporte = new Reporte();
            reporte.setDescripcion(descripcion);
            reporte.setPlaca(placa);
            reporte.setDireccion(direccion);
            reporte.setLatitud(latitud);
            reporte.setLongitud(longitud);
            reporte.setFechaIncidente(LocalDate.parse(fechaIncidente));
            reporte.setHoraIncidente(LocalTime.parse(horaIncidente));
            reporte.setEstado("pendiente");
            reporte.setCreatedAt(LocalDateTime.now());
            reporte.setUpdatedAt(LocalDateTime.now());

            Reporte reporteGuardado = reporteRepository.save(reporte);

            for (MultipartFile archivo : archivos) {

                String url = fileStorageService.guardarArchivo(archivo, reporteGuardado.getId());

                Evidencia evidencia = new Evidencia();
                evidencia.setTipo(archivo.getContentType());
                evidencia.setArchivo(url);
                evidencia.setReporte(reporteGuardado);

                EvidenciaRepository.save(evidencia);
            }

            return ResponseEntity.ok(reporteGuardado);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
