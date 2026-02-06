package com.reporteloya.recuperar_password.service;

import com.reporteloya.recuperar_password.dto.ResetPasswordRequest;
import com.reporteloya.recuperar_password.entity.PasswordResetToken;
import com.reporteloya.recuperar_password.repository.TokenRepository;
import com.reporteloya.recuperar_password.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder; // Usar la interfaz
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor // Inyecta automáticamente los campos 'final'
public class PasswordService {

    private final UsuarioRepository usuarioRepository;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;
    // CRÍTICO: Inyectamos el PasswordEncoder de Spring Security, no lo instanciamos
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public boolean enviarEnlaceRecuperacion(String email) {
        return usuarioRepository.findByEmail(email).map(usuario -> {
            String token = UUID.randomUUID().toString();

            PasswordResetToken resetToken = new PasswordResetToken(
                    usuario.getEmail(), // Usar el email del usuario encontrado
                    token,
                    LocalDateTime.now().plusMinutes(15) // Token válido por 15 minutos
            );
            tokenRepository.save(resetToken);

            String enlace = "https://reporteloya.com/reset-password?token=" + token;
            // Asumiendo que EmailService existe y tiene este método
            emailService.enviarCorreoRecuperacion(email, enlace);

            return true;
        }).orElse(false);
    }

    @Transactional
    public boolean resetPassword(ResetPasswordRequest request) {
        // 1. Buscar el token y validar expiración
        return tokenRepository.findByToken(request.getToken()).map(tokenEntity -> {
            if (tokenEntity.getExpirationDate().isBefore(LocalDateTime.now())) {
                tokenRepository.delete(tokenEntity);
                return false; // Token expirado
            }

            // 2. Buscar el usuario y actualizar la contraseña
            return usuarioRepository.findByEmail(tokenEntity.getEmail()).map(usuario -> {
                // CRÍTICO: Hashear la nueva contraseña antes de guardar
                usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
                usuarioRepository.save(usuario);

                // 3. Eliminar el token después de un uso exitoso
                tokenRepository.delete(tokenEntity);
                return true;
            }).orElse(false);
        }).orElse(false); // Token inválido
    }
}