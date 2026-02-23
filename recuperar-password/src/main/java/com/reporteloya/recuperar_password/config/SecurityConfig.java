package com.reporteloya.recuperar_password.config;

import lombok.RequiredArgsConstructor;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // === PERMITIR CORS PARA ANGULAR ===
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // === DESACTIVAR CSRF POR USO DE JWT ===
            .csrf(csrf -> csrf.disable())

            // === REGLAS DE AUTORIZACIÓN ===
            .authorizeHttpRequests(auth -> auth
                // Rutas de Auth y Password
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/password/**").permitAll()

                // === LÍNEA AGREGADA: LIBERAR BUSCADOR DE AGENTES ===
                .requestMatchers("/agentes/**").permitAll()

                // RUTAS POR ROL (Mantener igual)
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/agente/**").hasRole("AGENTE")
                .requestMatchers("/api/ciudadano/**").hasRole("CIUDADANO")

                // Cualquier otro endpoint requiere autenticación
                .anyRequest().authenticated()
            )

            // === NO MANEJAR SESIÓN ===
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // === PROVEEDOR DE AUTENTICACIÓN ===
            .authenticationProvider(authenticationProvider)

            // === AÑADIR FILTRO JWT ANTES DE LA AUTENTICACIÓN ===
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
            "http://localhost:4200",
            "https://frontend-app-1-0-0.onrender.com"
        ));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}