package com.reporteloya.recuperar_password.service;

import com.reporteloya.recuperar_password.entity.Agentes;
import com.reporteloya.recuperar_password.repository.AgenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AgenteService {
    @Autowired
    private AgenteRepository agenteRepository;

    public List<Agentes> listarTodos() {
        return agenteRepository.findAll();
    }

    public Optional<Agentes> buscarPorPlaca(String placa) {
        return agenteRepository.findByPlacaIgnoreCase(placa);
    }

    public Agentes guardar(Agentes agente) {
    return agenteRepository.save(agente); // Esto es lo que inserta en MySQL
}
}