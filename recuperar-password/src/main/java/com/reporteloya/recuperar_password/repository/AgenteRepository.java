package com.reporteloya.recuperar_password.repository;

import com.reporteloya.recuperar_password.entity.Agentes; // <--- Importante corregir esto
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AgenteRepository extends JpaRepository<Agentes, Long> {
    Optional<Agentes> findByPlacaIgnoreCase(String placa);
}