package com.reporteloya.recuperar_password.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "reportes")
@Data
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reporte")
    private Long id;

    // Relación con Usuario
    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
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

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    // Enumeraciones para tipo de infracción y estado
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