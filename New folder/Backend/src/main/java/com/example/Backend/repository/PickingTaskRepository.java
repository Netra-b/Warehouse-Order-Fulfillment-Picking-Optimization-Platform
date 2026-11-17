package com.example.Backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Backend.entity.PickingTask;

public interface PickingTaskRepository extends JpaRepository<PickingTask, Long> {

    List<PickingTask> findAllByOrderByStatusAscIdAsc();

    List<PickingTask> findAllByOrder_Id(Long orderId);
}
