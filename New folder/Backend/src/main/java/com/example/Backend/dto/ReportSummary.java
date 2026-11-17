package com.example.Backend.dto;

import java.math.BigDecimal;
import java.util.Map;

public record ReportSummary(
        long totalProducts,
        long totalUnits,
        long lowStockCount,
        long totalOrders,
        long pendingOrders,
        long completedOrders,
        long openPickingTasks,
        BigDecimal completedOrderValue,
        BigDecimal inventoryValue,
        Map<String, Long> ordersByStatus) {
}
