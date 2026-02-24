package com.reporteloya.recuperar_password.service;

import com.reporteloya.recuperar_password.entity.Usuario;


    public record AuthResult(String token, Usuario usuario) {
}

