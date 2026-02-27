package com.reporteloya.recuperar_password.controller;

import com.reporteloya.recuperar_password.dto.AuthResponse;
import com.reporteloya.recuperar_password.dto.LoginRequest;
import com.reporteloya.recuperar_password.dto.RegisterRequest;
import com.reporteloya.recuperar_password.entity.Usuario;
import com.reporteloya.recuperar_password.service.AuthResult;
import com.reporteloya.recuperar_password.service.AuthService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request,
            HttpServletResponse response) {

        try {
            AuthResult result = authService.register(request);
            Usuario usuario = result.usuario();

            setJwtCookie(response, result.token());

            return ResponseEntity.status(201).body(
                    AuthResponse.builder()
                            .userId(usuario.getId())
                            .email(usuario.getEmail())
                            .role(usuario.getRole())
                            .build());

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error interno al registrar el usuario.");
        }
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response) {

        try {
            AuthResult result = authService.login(request);
            Usuario usuario = result.usuario();

            setJwtCookie(response, result.token());

            return ResponseEntity.ok(
                    AuthResponse.builder()
                            .userId(usuario.getId())
                            .email(usuario.getEmail())
                            .role(usuario.getRole())
                            .build());

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error interno al procesar el login.");
        }
    }

    // =========================
    // LOGOUT
    // =========================
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {

        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false) // true solo en HTTPS
                .path("/")
                .maxAge(0)
                .build();

        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok().build();
    }

    // =========================
    // COOKIE HELPER
    // =========================
    private void setJwtCookie(HttpServletResponse response, String token) {

        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(false) // true en producción con HTTPS
                .path("/")
                .maxAge(60 * 60) // 20 minutos
                .sameSite("Lax") // importante para navegador moderno
                .build();

        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
    @GetMapping("/me")
public ResponseEntity<?> getCurrentUser() {

    var authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    Usuario usuario = (Usuario) authentication.getPrincipal();

    return ResponseEntity.ok(
            AuthResponse.builder()
                    .userId(usuario.getId())
                    .email(usuario.getEmail())
                    .role(usuario.getRole())
                    .build()
    );
}

}
