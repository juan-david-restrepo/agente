package com.reporteloya.recuperar_password.service;


import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;  
import com.reporteloya.recuperar_password.entity.Reporte;
import com.reporteloya.recuperar_password.repository.ReporteRepository;


@Service
public class ReporteService {

    private final ReporteRepository reporteRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ReporteService(ReporteRepository reporteRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.reporteRepository = reporteRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Reporte crearReporte(Reporte reporte) {

        reporte.setEstado("pendiente");

        Reporte guardado = reporteRepository.save(reporte);

        // 🔥 Notificar en tiempo real
        messagingTemplate.convertAndSend("/topic/admins", guardado);
        messagingTemplate.convertAndSend("/topic/agents", guardado);

        return guardado;
    }
}
