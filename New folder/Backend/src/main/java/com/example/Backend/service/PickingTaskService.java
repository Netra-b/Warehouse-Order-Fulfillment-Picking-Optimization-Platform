package com.example.Backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.Backend.dto.PickingTaskResponse;
import com.example.Backend.entity.CustomerOrder;
import com.example.Backend.entity.OrderItem;
import com.example.Backend.entity.PickingTask;
import com.example.Backend.repository.OrderRepository;
import com.example.Backend.repository.PickingTaskRepository;
import com.example.Backend.repository.ProductRepository;

@Service
public class PickingTaskService {

    private final PickingTaskRepository pickingTaskRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public PickingTaskService(
            PickingTaskRepository pickingTaskRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository) {
        this.pickingTaskRepository = pickingTaskRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public List<PickingTaskResponse> getAllTasks() {
        return pickingTaskRepository.findAllByOrderByStatusAscIdAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PickingTaskResponse completeTask(Long id) {
        PickingTask task = pickingTaskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Picking task not found"));
        if ("PICKED".equals(task.getStatus())) {
            return toResponse(task);
        }

        if (task.getProduct().getQuantity() < task.getQuantityToPick()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Insufficient stock to complete this picking task");
        }

        task.getProduct().setQuantity(task.getProduct().getQuantity() - task.getQuantityToPick());
        productRepository.save(task.getProduct());
        task.setStatus("PICKED");

        CustomerOrder order = orderRepository.findById(task.getOrder().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        for (OrderItem item : order.getItems()) {
            if (item.getProduct().getId().equals(task.getProduct().getId())) {
                item.addPickedQuantity(task.getQuantityToPick());
                break;
            }
        }

        List<PickingTask> orderTasks = pickingTaskRepository.findAllByOrder_Id(order.getId());
        boolean allPicked = orderTasks.stream()
                .allMatch(pickingTask -> pickingTask.getId().equals(task.getId())
                        || "PICKED".equals(pickingTask.getStatus()));
        order.setStatus(allPicked ? "COMPLETED" : "IN_PROGRESS");
        return toResponse(pickingTaskRepository.save(task));
    }

    private PickingTaskResponse toResponse(PickingTask task) {
        return new PickingTaskResponse(
                task.getId(),
                task.getOrder().getId(),
                task.getOrder().getCustomerName(),
                task.getProduct().getId(),
                task.getProduct().getSku(),
                task.getProduct().getName(),
                task.getLocationCode(),
                task.getQuantityToPick(),
                task.getStatus());
    }
}
