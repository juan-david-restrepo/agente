package com.reporteloya.recuperar_password.controller;

import com.reporteloya.recuperar_password.dto.AuthResponse;
import com.reporteloya.recuperar_password.dto.LoginRequest;
import com.reporteloya.recuperar_password.dto.RegisterRequest;
import com.reporteloya.recuperar_password.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Registro de usuario.
     * Retorna AuthResponse (token, role, userId) y 201 Created.
     * Además añade el header Authorization: Bearer <token>
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @RequestBody RegisterRequest request,
            UriComponentsBuilder uriBuilder) {
        try {
            AuthResponse response = authService.register(request);

            // Construimos header Authorization para que el front pueda usarlo directamente
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + response.getToken());

            // Opcional: Exponer el header para CORS (tu CORS ya expone "Authorization")
            // Devolvemos 201 Created y body con token + role + userId
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .headers(headers)
                    .body(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al registrar el usuario.");
        }
    }

    /**
     * Login (autenticación).
     * Retorna 200 OK con AuthResponse (token, role, userId) y header Authorization.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + response.getToken());

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .body(response);

        } catch (IllegalArgumentException e) {
            // Credenciales invalidas u otros errores controlados por el service
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        } catch (Exception e) {
            // Error inesperado
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al procesar el login.");
        }
    }
}
