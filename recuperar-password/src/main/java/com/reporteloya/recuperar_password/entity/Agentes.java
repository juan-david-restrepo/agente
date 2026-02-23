package com.reporteloya.recuperar_password.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "agentes")
@Data
public class Agentes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String placa;
    private String nombre;
    private String documento;
    private String telefono;
    private String estado;
    private Double promedioResenas;
    private String foto;

    // Relación para permitir múltiples tareas
    @OneToMany(mappedBy = "agente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Tarea> listaTareas = new ArrayList<>();
}