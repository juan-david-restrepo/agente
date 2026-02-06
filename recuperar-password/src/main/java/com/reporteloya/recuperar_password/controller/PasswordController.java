package com.reporteloya.recuperar_password.controller;

import com.reporteloya.recuperar_password.dto.RecuperarRequest;
import com.reporteloya.recuperar_password.dto.ResetPasswordRequest;
import com.reporteloya.recuperar_password.service.PasswordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/password")
@CrossOrigin(origins = "*")
public class PasswordController {

    private final PasswordService passwordService;

    public PasswordController(PasswordService passwordService) {
        this.passwordService = passwordService;
    }

    @PostMapping("/reset-request")
    public ResponseEntity<String> enviarEnlace(@RequestBody RecuperarRequest request) {
        boolean enviado = passwordService.enviarEnlaceRecuperacion(request.getEmail());
        if (enviado) {
            return ResponseEntity.ok("Correo de recuperación enviado correctamente");
        } else {
            return ResponseEntity.badRequest().body("El correo ingresado no está registrado");
        }
    }

      @PostMapping("/reset")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        boolean actualizado = passwordService.resetPassword(request);
        if (actualizado) {
            return ResponseEntity.ok("Contraseña actualizada correctamente");
        } else {
            return ResponseEntity.badRequest().body("Token inválido o expirado");
        }
    }
}