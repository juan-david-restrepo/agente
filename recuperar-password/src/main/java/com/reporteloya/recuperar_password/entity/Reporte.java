package com.reporteloya.recuperar_password.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.CascadeType;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "reporte")
public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reporte")
    private Long id;

    @Column(name = "id_usuario")
    private Long idUsuario;

    private String tipoInfraccion;
    private String descripcion;
    private String direccion;
    private Double latitud;
    private Double longitud;
    private String placa;
    private LocalDate fechaIncidente;
    private LocalTime horaIncidente;
    private String estado;

    @OneToMany(mappedBy = "reporte", cascade = CascadeType.ALL)
    private List<Evidencia> evidencias;


@PrePersist
protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
}

@PreUpdate
protected void onUpdate() {
    updatedAt = LocalDateTime.now();
}

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


}


