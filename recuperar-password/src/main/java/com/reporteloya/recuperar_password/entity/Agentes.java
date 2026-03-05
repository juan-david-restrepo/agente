package com.reporteloya.recuperar_password.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "agentes")
@Data
public class Agentes extends Usuario {

    private String placa;
    private String nombre;
    private String documento;
    private String telefono;
    private String estado;
    private String foto;

    @OneToMany(mappedBy = "agente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Tarea> listaTareas = new ArrayList<>();

    @OneToMany(mappedBy = "agente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reporte> reportes;
}