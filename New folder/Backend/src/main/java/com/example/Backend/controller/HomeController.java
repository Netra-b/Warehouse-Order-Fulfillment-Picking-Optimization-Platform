package com.example.Backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Warehouse Order Fulfillment System is Running Successfully!";
    }

    @GetMapping("/api/health")
    public String health() {
        return "Backend API is Working!";
    }
}
