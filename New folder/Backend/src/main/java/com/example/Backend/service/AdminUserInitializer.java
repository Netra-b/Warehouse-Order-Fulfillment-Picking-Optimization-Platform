package com.example.Backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.Backend.entity.AppUser;
import com.example.Backend.repository.AppUserRepository;

@Component
public class AdminUserInitializer implements ApplicationRunner {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String password;

    public AdminUserInitializer(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.username:}") String username,
            @Value("${app.admin.password:}") String password) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.username = username.trim();
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (username.isEmpty() && password.isEmpty()) {
            if (userRepository.count() == 0) {
                throw new IllegalStateException(
                        "No login account exists. Set ADMIN_USERNAME and ADMIN_PASSWORD to create the first administrator.");
            }
            return;
        }

        if (username.isEmpty() || password.isBlank()) {
            throw new IllegalStateException("Set both ADMIN_USERNAME and ADMIN_PASSWORD to bootstrap an administrator.");
        }
        if (password.length() < 12) {
            throw new IllegalStateException("ADMIN_PASSWORD must be at least 12 characters long.");
        }

        userRepository.findByUsernameIgnoreCase(username)
                .orElseGet(() -> userRepository.save(
                        new AppUser(username, passwordEncoder.encode(password), "ADMIN")));
    }
}
