package com.reporteloya.recuperar_password.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.reporteloya.recuperar_password.entity.Reporte;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Long> {
}
