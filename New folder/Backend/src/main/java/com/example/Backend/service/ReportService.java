package com.example.Backend.service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Backend.dto.ReportSummary;
import com.example.Backend.entity.CustomerOrder;
import com.example.Backend.entity.OrderItem;
import com.example.Backend.entity.Product;
import com.example.Backend.repository.OrderRepository;
import com.example.Backend.repository.PickingTaskRepository;
import com.example.Backend.repository.ProductRepository;

@Service
public class ReportService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PickingTaskRepository pickingTaskRepository;

    public ReportService(
            ProductRepository productRepository,
            OrderRepository orderRepository,
            PickingTaskRepository pickingTaskRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.pickingTaskRepository = pickingTaskRepository;
    }

    @Transactional(readOnly = true)
    public ReportSummary getSummary() {
        var products = productRepository.findAll();
        var orders = orderRepository.findAllByOrderByCreatedAtDesc();
        Map<String, Long> ordersByStatus = orders.stream()
                .collect(Collectors.groupingBy(CustomerOrder::getStatus, Collectors.counting()));
        long totalUnits = products.stream().mapToLong(Product::getQuantity).sum();
        long lowStockCount = products.stream().filter(product -> product.getQuantity() <= 5).count();
        long pendingOrders = orders.stream().filter(order -> "PENDING".equals(order.getStatus())).count();
        long completedOrders = orders.stream().filter(order -> "COMPLETED".equals(order.getStatus())).count();
        long openTasks = pickingTaskRepository.findAll().stream()
                .filter(task -> !"PICKED".equals(task.getStatus()))
                .count();
        BigDecimal inventoryValue = products.stream()
                .map(product -> product.getUnitPrice().multiply(BigDecimal.valueOf(product.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal completedOrderValue = orders.stream()
                .filter(order -> "COMPLETED".equals(order.getStatus()))
                .flatMap(order -> order.getItems().stream())
                .map(ReportService::lineValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ReportSummary(
                products.size(),
                totalUnits,
                lowStockCount,
                orders.size(),
                pendingOrders,
                completedOrders,
                openTasks,
                completedOrderValue,
                inventoryValue,
                ordersByStatus);
    }

    private static BigDecimal lineValue(OrderItem item) {
        return item.getProduct().getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
    }
}
