package com.reporteloya.recuperar_password.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "reportes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reporte")
    private Long id;

    // 🔥 Relación correcta con Usuario
    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_infraccion")
    private TipoInfraccion tipoInfraccion;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private String direccion;

    private Double latitud;
    private Double longitud;

    private String placa;

    private LocalDate fechaIncidente;
    private LocalTime horaIncidente;

    @Enumerated(EnumType.STRING)
    private EstadoReporte estado;

    // 🔥 Relación con Evidencia
    @OneToMany(mappedBy = "reporte", cascade = CascadeType.ALL)
    private List<Evidencia> evidencias;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // 🔹 Enumeraciones
    public enum TipoInfraccion {
        mal_estacionado,
        exceso_velocidad,
        pico_placa,
        otro
    }

    public enum EstadoReporte {
        pendiente,
        aprobado,
        rechazado
    }
}

