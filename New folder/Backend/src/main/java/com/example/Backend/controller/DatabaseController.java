package com.example.Backend.controller;

import java.sql.Connection;
import javax.sql.DataSource;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DatabaseController {

    private final DataSource dataSource;

    public DatabaseController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/api/database-test")
    public String testDatabase() {
        try (Connection connection = dataSource.getConnection()) {
            return "MySQL Database Connected Successfully!";
        } catch (Exception e) {
            e.printStackTrace();
            return "Database Connection Failed: " + e.getMessage();
        }
    }
}
