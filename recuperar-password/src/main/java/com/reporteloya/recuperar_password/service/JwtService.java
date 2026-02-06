package com.reporteloya.recuperar_password.service;

// Importar la entidad Usuario del proyecto actual, no la antigua User
import com.reporteloya.recuperar_password.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // Se recomienda obtener la clave del application.properties para mayor
    // seguridad
    // Aquí se mantiene su valor, pero se envuelve en una propiedad de Spring
    // @Value("${jwt.secret.key}")
    private static final String SECRET_KEY = "U3VwZXJEdXBlclNlY3JldEtleUZvckpXVEV4YW1wbGUxMjM0NTY=";

    // Tiempo de expiración del token (10 horas)
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 10;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Genera el token JWT incrustando el Rol y el ID del Usuario en los claims.
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {

        // 1. CRÍTICO: Casteamos la interfaz UserDetails a nuestra clase Usuario
        // para acceder al Rol y al ID.
        if (userDetails instanceof Usuario customUsuario) {
            extraClaims.put("role", customUsuario.getRole().name());
            extraClaims.put("userId", customUsuario.getId());
        }

        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername()) // El Subject es el Email
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}