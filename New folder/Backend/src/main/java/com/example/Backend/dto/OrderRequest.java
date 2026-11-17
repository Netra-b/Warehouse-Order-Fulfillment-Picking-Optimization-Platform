package com.example.Backend.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record OrderRequest(
        @NotBlank String customerName,
        @NotEmpty List<@Valid OrderLineRequest> items) {
}
