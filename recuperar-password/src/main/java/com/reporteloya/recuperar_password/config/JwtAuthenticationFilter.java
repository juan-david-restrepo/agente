package com.reporteloya.recuperar_password.config;

import com.reporteloya.recuperar_password.entity.Usuario;
import com.reporteloya.recuperar_password.repository.UsuarioRepository;
import com.reporteloya.recuperar_password.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String jwt = null;

        // =========================
        // 1️⃣ Intentar obtener token desde Authorization header
        // =========================
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        }

        // =========================
        // 2️⃣ Si no viene por header, buscar en Cookie
        // =========================
        if (jwt == null && request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    break;
                }
            }
        }

        // Si no hay token → continuar
        if (jwt == null || jwt.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        // =========================
        // 3️⃣ Extraer username
        // =========================
        String username;
        try {
            username = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            filterChain.doFilter(request, response);
            return;
        }

        // =========================
        // 4️⃣ Autenticación
        // =========================
        if (username != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            Usuario user = usuarioRepository.findByEmail(username)
                    .orElse(null);

            if (user != null && jwtService.isTokenValid(jwt, user)) {

                // Extraer rol desde el token
                String roleFromToken = jwtService.extractClaim(jwt,
                        claims -> claims.get("role", String.class));

                GrantedAuthority authority =
                        new SimpleGrantedAuthority("ROLE_" + roleFromToken);

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                Collections.singletonList(authority)
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request));

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}