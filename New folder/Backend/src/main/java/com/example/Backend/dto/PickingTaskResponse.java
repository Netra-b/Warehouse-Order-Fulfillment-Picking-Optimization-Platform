package com.example.Backend.dto;

public record PickingTaskResponse(
        Long id,
        Long orderId,
        String customerName,
        Long productId,
        String sku,
        String productName,
        String locationCode,
        int quantityToPick,
        String status) {
}
