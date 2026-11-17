package com.example.Backend.dto;

import java.math.BigDecimal;

public record OrderLineResponse(
        Long productId,
        String sku,
        String productName,
        int quantity,
        int pickedQuantity,
        BigDecimal unitPrice) {
}
