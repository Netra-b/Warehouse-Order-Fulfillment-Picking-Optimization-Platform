package com.example.Backend.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.Backend.dto.OrderLineRequest;
import com.example.Backend.dto.OrderLineResponse;
import com.example.Backend.dto.OrderRequest;
import com.example.Backend.dto.OrderResponse;
import com.example.Backend.entity.CustomerOrder;
import com.example.Backend.entity.OrderItem;
import com.example.Backend.entity.PickingTask;
import com.example.Backend.entity.Product;
import com.example.Backend.repository.OrderRepository;
import com.example.Backend.repository.PickingTaskRepository;
import com.example.Backend.repository.ProductRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PickingTaskRepository pickingTaskRepository;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            PickingTaskRepository pickingTaskRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.pickingTaskRepository = pickingTaskRepository;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Map<Long, Integer> quantitiesByProduct = new LinkedHashMap<>();
        for (OrderLineRequest line : request.items()) {
            quantitiesByProduct.merge(line.productId(), line.quantity(), Integer::sum);
        }

        List<Product> products = new ArrayList<>();
        for (Map.Entry<Long, Integer> entry : quantitiesByProduct.entrySet()) {
            Product product = productRepository.findById(entry.getKey())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
            if (product.getQuantity() < entry.getValue()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Insufficient stock for " + product.getName());
            }
            products.add(product);
        }

        CustomerOrder order = new CustomerOrder(request.customerName().trim());
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            int quantity = quantitiesByProduct.get(product.getId());
            order.addItem(new OrderItem(product, quantity));
        }

        CustomerOrder savedOrder = orderRepository.save(order);
        List<PickingTask> tasks = savedOrder.getItems().stream()
                .map(item -> new PickingTask(savedOrder, item.getProduct(), item.getQuantity()))
                .toList();
        pickingTaskRepository.saveAll(tasks);
        return toResponse(savedOrder);
    }

    private OrderResponse toResponse(CustomerOrder order) {
        List<OrderLineResponse> items = order.getItems().stream()
                .map(item -> new OrderLineResponse(
                        item.getProduct().getId(),
                        item.getProduct().getSku(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getPickedQuantity(),
                        item.getProduct().getUnitPrice()))
                .toList();
        return new OrderResponse(
                order.getId(),
                order.getCustomerName(),
                order.getStatus(),
                order.getCreatedAt(),
                items);
    }
}
