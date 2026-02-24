package com.reporteloya.recuperar_password.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "evidencia")
public class Evidencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evidencia")
    private Long id;

    private String tipo;
    private String archivo;

    @ManyToOne
    @JoinColumn(name = "id_reporte")
    private Reporte reporte;

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public void setArchivo(String archivo) {
        this.archivo = archivo;
    }

    public void setReporte(Reporte reporte) {
        this.reporte = reporte;
    }

}