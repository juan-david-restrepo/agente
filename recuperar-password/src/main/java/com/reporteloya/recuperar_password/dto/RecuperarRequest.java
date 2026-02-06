package com.reporteloya.recuperar_password.dto;

public class RecuperarRequest {

    private String email;

    public RecuperarRequest() {}

    public RecuperarRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}