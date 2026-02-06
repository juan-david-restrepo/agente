package com.reporteloya.recuperar_password.service;

import com.reporteloya.recuperar_password.entity.Role;
import com.reporteloya.recuperar_password.entity.Usuario; // Su entidad Usuario
import com.reporteloya.recuperar_password.dto.AuthResponse;
import com.reporteloya.recuperar_password.dto.LoginRequest;
import com.reporteloya.recuperar_password.dto.RegisterRequest;
import com.reporteloya.recuperar_password.repository.UsuarioRepository; // Su repositorio

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;

@Service
@RequiredArgsConstructor
public class AuthService {

    // Dependencias Inyectadas (usando @RequiredArgsConstructor)
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService; // Asumo que JwtService está aquí o en un subpaquete accesible
    private final AuthenticationManager authenticationManager;

    /**
     * Registra un nuevo usuario con los datos del formulario.
     * 
     * @param request Datos del nuevo usuario (email, password, role, etc.).
     * @return AuthResponse con el Token JWT.
     */
    public AuthResponse register(RegisterRequest request) {
        // 1. Validación de unicidad de Email
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            // Se recomienda usar una excepción más específica que se pueda capturar en el
            // Controller
            throw new IllegalArgumentException("Error: El correo electrónico ya está registrado.");
        }

        // 2. Creación y Mapeo de la Entidad Usuario
        // Se utiliza el Builder (gracias a Lombok) y se hashea la contraseña.
        Usuario nuevoUsuario = Usuario.builder()
                // Campos del formulario (ajustados al DTO y Entidad)
                .tipoDocumento(request.getTipoDocumento())
                .numeroDocumento(request.getNumeroDocumento())
                .nombreCompleto(request.getNombreCompleto())

                // Campos de Autenticación
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // CRÍTICO: Hashear la contraseña

                // Asignación de Rol: forzamos `USER` por seguridad (ignorar rol enviado por
                // cliente)
                .role(Role.CIUDADANO)
                .build();

        // 3. Guardar en la Base de Datos (manejo de posible duplicado por constraint)
        try {
            usuarioRepository.save(nuevoUsuario);
        } catch (DataIntegrityViolationException ex) {
            // Convierte el error de BD en una excepción más clara
            throw new IllegalArgumentException("Error: El correo electrónico ya está registrado.");
        }

        // 4. Generar Token JWT para iniciar sesión inmediatamente
        String jwtToken = jwtService.generateToken(nuevoUsuario);

        // 5. Devolver Respuesta incluyendo datos útiles para el Front-end
        return AuthResponse.builder()
                .token(jwtToken)
                .userId(nuevoUsuario.getId())
                .email(nuevoUsuario.getEmail())
                .role(nuevoUsuario.getRole())
                .build();
    }

    /**
     * Autentica un usuario y devuelve un token JWT si las credenciales son válidas.
     * 
     * @param request Credenciales del usuario (email y password).
     * @return AuthResponse con el Token JWT.
     */
    public AuthResponse login(LoginRequest request) {
        // 1. Autenticación con Spring Security
        // El AuthenticationManager utiliza el UserDetailsService (configurado en
        // ApplicationConfig)
        // para buscar al usuario por email y verificar la contraseña hasheada.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), // Usamos el EMAIL como el "Username" de Spring Security
                        request.getPassword()));

        // 2. Si la autenticación no lanzó excepción, buscamos al usuario para generar
        // el token
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado con el correo: " + request.getEmail()));

        // 3. Generar Token JWT
        String jwtToken = jwtService.generateToken(usuario);

        // 4. Devolver Respuesta con metadatos del usuario
        return AuthResponse.builder()
                .token(jwtToken)
                .userId(usuario.getId())
                .email(usuario.getEmail())
                .role(usuario.getRole())
                .build();
    }
}