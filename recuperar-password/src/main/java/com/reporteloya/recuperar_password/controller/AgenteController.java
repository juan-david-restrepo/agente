package com.reporteloya.recuperar_password.controller;

import com.reporteloya.recuperar_password.entity.Agentes;
import com.reporteloya.recuperar_password.entity.Tarea;
import com.reporteloya.recuperar_password.repository.TareaRepository;
import com.reporteloya.recuperar_password.service.AgenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional; // IMPORTANTE PARA EL BORRADO
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/agentes")
@CrossOrigin(origins = {"http://localhost:4200", "https://frontend-app-1-0-0.onrender.com"})
public class AgenteController {

    @Autowired
    private AgenteService agenteService;

    @Autowired
    private TareaRepository tareaRepository;

    // =========================
    // LISTAR TODOS
    // =========================
    @GetMapping
    public List<Agentes> obtenerTodos() {
        return agenteService.listarTodos();
    }

    // =========================
    // BUSCAR POR PLACA
    // =========================
    @GetMapping("/{placa}")
    public ResponseEntity<Agentes> obtenerPorPlaca(@PathVariable String placa) {
        return agenteService.buscarPorPlaca(placa)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================
    // AGREGAR TAREA (Múltiples)
    // =========================
    @PostMapping("/{placa}/tareas")
    public ResponseEntity<Agentes> agregarTarea(@PathVariable String placa, @RequestBody Tarea nuevaTarea) {
        return agenteService.buscarPorPlaca(placa).map(agente -> {
            nuevaTarea.setAgente(agente); 
            agente.getListaTareas().add(nuevaTarea); 
            agente.setEstado("OCUPADO");
            
            Agentes actualizado = agenteService.guardar(agente); 
            return ResponseEntity.ok(actualizado);
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // ELIMINAR TAREA (CORRECCIÓN DEFINITIVA)
    // ==========================================
    @DeleteMapping("/tareas/{id}")
    @Transactional // Garantiza que los cambios se apliquen en la BD
    public ResponseEntity<Void> eliminarTarea(@PathVariable Long id) {
        return tareaRepository.findById(id).map(tarea -> {
            // 1. Rompemos el vínculo en Java para evitar conflictos de Foreign Key
            Agentes agente = tarea.getAgente();
            if (agente != null) {
                agente.getListaTareas().remove(tarea); // Se quita de la lista del Agente
            }
            
            // 2. Ejecutamos el borrado físico en MySQL
            tareaRepository.delete(tarea);
            
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}