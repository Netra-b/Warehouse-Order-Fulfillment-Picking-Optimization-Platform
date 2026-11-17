package com.example.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Backend.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
