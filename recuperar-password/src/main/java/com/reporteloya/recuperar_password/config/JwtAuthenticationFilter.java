package com.reporteloya.recuperar_password.config; // << PAQUETE CORREGIDO

import com.reporteloya.recuperar_password.service.JwtService; // << IMPORT CORREGIDO
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;



import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Filtro encargado de validar el JWT y construir la autenticación.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // 1. Obtenemos encabezado Authorization
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extraer token
        jwt = authHeader.substring(7);

        // 3. Extraer username (email) del token
        // NOTA: jwtService puede lanzar una excepción (ej. SignatureException si el
        // token es inválido)
        try {
            username = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            // Si hay error en el token (expirado, inválido), simplemente ignoramos y
            // dejamos pasar
            // para que Spring Security maneje el 403 Forbidden o 401 Unauthorized más
            // adelante.
            filterChain.doFilter(request, response);
            return;
        }

        // 4. Si el usuario no está autenticado aún:
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 5. Validación del token
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // >>> EXTRAER ROL DEL TOKEN <<<
                String roleFromToken = jwtService.extractClaim(jwt,
                        claims -> claims.get("role", String.class));

                // Convertimos el rol extraído (ej. USER) al formato que Spring Security
                // requiere (ej. ROLE_USER)
                // Esto es vital para las verificaciones @PreAuthorize("hasRole('ADMIN')")
                GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + roleFromToken);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        Collections.singletonList(authority) // Usamos SOLO el rol del JWT
                );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                // 6. Guardamos autenticación en contexto de seguridad
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 7. Continuamos con el filtro
        filterChain.doFilter(request, response);
    }
}