package com.example.Backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record OrderLineRequest(
        @NotNull @Positive Long productId,
        @Positive int quantity) {
}
