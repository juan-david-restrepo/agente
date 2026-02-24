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

                
                                // =========================
                                // CORS (listo para multi-dominio)
                                // =========================
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // =========================
                                // CSRF
                                // =========================
                                .csrf(csrf -> csrf.disable())

                                // =========================
                                // AUTORIZACIÓN
                                // =========================
                                .authorizeHttpRequests(auth -> auth

                                                // SOLO login y register públicos

                                                
                                                .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                                                .requestMatchers("/api/password/**").permitAll()
                                                

                                                // 👇 ESTE DEBE REQUERIR AUTH
                                                .requestMatchers("/api/auth/me").authenticated()

                                                // Roles
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                                                .requestMatchers("/api/agente/**").hasRole("AGENTE")
                                                .requestMatchers("/api/ciudadano/**").hasRole("CIUDADANO")
                                                .requestMatchers("/api/reportes/**").authenticated()
                                               

                                                .anyRequest().authenticated())

                                // =========================
                                // STATELESS
                                // =========================
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // =========================
                                // AUTH PROVIDER
                                // =========================
                                .authenticationProvider(authenticationProvider)

                                // =========================
                                // JWT FILTER
                                // =========================
                                .addFilterBefore(
                                                jwtAuthFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        /**
         * Configuración CORS.
         * Permite cookies HttpOnly (allowCredentials = true)
         */
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                // 🔥 ORIGEN EXACTO (NO "*")
                configuration.setAllowedOrigins(List.of("http://localhost:4200"));

                configuration.setAllowedMethods(List.of(
                                "GET", "POST", "PUT", "DELETE", "OPTIONS"));

                configuration.setAllowedHeaders(List.of("*"));

                configuration.setAllowCredentials(true); // necesario para cookies

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);

                

                return source;
        }

}
