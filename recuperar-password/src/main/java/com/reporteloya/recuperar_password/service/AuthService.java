package com.reporteloya.recuperar_password.service;

import com.reporteloya.recuperar_password.entity.Role;
import com.reporteloya.recuperar_password.entity.Usuario;
import com.reporteloya.recuperar_password.dto.LoginRequest;
import com.reporteloya.recuperar_password.dto.RegisterRequest;
import com.reporteloya.recuperar_password.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Registro de usuario
     */
    public AuthResult register(RegisterRequest request) {

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Error: El correo electrónico ya está registrado.");
        }

        Usuario nuevoUsuario = Usuario.builder()
                .tipoDocumento(request.getTipoDocumento())
                .numeroDocumento(request.getNumeroDocumento())
                .nombreCompleto(request.getNombreCompleto())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CIUDADANO)
                .build();

        try {
            usuarioRepository.save(nuevoUsuario);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("Error: El correo electrónico ya está registrado.");
        }

        String jwtToken = jwtService.generateToken(nuevoUsuario);

        return new AuthResult(jwtToken, nuevoUsuario);
    }

    /**
     * Login de usuario
     */
    public AuthResult login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado con el correo: " + request.getEmail()));

        String jwtToken = jwtService.generateToken(usuario);

        return new AuthResult(jwtToken, usuario);
    }
}
