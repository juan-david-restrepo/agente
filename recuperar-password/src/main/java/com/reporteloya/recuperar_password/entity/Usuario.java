package com.reporteloya.recuperar_password.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "usuarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    @Column(name = "tipo_documento")
    private String tipoDocumento;

    @Column(name = "numero_documento")
    private String numeroDocumento;

    @Column(name = "nombre_completo", nullable = false)
    private String nombreCompleto;

    @Column(name = "email",unique = true, nullable = false)
    private String email;

    @Column(name = "password",nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

        // ===== Relación con reportes =====
    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    @JsonIgnore // Evita bucles infinitos al serializar
    private List<Reporte> reportes;

    // Getter y Setter para reportes (Lombok @Data genera setters/getters, pero se puede definir explícito)
    public List<Reporte> getReportes() {
        return reportes;
    }

    public void setReportes(List<Reporte> reportes) {
        this.reportes = reportes;
    }

    // ===== UserDestails =====
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
