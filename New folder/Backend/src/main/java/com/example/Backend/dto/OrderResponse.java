package com.example.Backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String customerName,
        String status,
        LocalDateTime createdAt,
        List<OrderLineResponse> items) {
}
