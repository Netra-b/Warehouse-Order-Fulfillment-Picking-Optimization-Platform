package com.example.Backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Backend.dto.PickingTaskResponse;
import com.example.Backend.service.PickingTaskService;

@RestController
@RequestMapping("/api/picking-tasks")
public class PickingTaskController {

    private final PickingTaskService pickingTaskService;

    public PickingTaskController(PickingTaskService pickingTaskService) {
        this.pickingTaskService = pickingTaskService;
    }

    @GetMapping
    public List<PickingTaskResponse> getAllTasks() {
        return pickingTaskService.getAllTasks();
    }

    @PatchMapping("/{id}/complete")
    public PickingTaskResponse completeTask(@PathVariable Long id) {
        return pickingTaskService.completeTask(id);
    }
}
