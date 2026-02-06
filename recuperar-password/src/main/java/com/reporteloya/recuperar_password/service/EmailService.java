package com.reporteloya.recuperar_password.service;


import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCorreoRecuperacion(String destinatario, String enlace) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destinatario);
        mensaje.setSubject("Recupera tu contraseña - RepórteloYa");
        mensaje.setText("Hola!,\n\nHemos recibido una solicitud para restablecer tu contraseña. "
                + "Haz clic en el siguiente enlace para continuar:\n\n"
                + enlace
                + "\n\nSi no solicitaste este cambio, ignora este mensaje.\n\n"
                + "Atentamente,\nEl equipo de RepórteloYa ");

        mailSender.send(mensaje);
    }
}