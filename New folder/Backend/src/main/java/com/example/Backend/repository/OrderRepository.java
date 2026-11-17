package com.example.Backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Backend.entity.CustomerOrder;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

    @EntityGraph(attributePaths = {"items", "items.product"})
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();

    @Override
    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<CustomerOrder> findById(Long id);
}
