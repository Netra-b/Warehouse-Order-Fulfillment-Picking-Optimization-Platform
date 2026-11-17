package com.example.Backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "picking_tasks")
public class PickingTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private CustomerOrder order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "location_code", nullable = false, length = 30)
    private String locationCode;

    @Column(name = "quantity_to_pick", nullable = false)
    private Integer quantityToPick;

    @Column(nullable = false, length = 30)
    private String status;

    protected PickingTask() {
    }

    public PickingTask(CustomerOrder order, Product product, Integer quantityToPick) {
        this.order = order;
        this.product = product;
        this.locationCode = product.getLocationCode();
        this.quantityToPick = quantityToPick;
        this.status = "PENDING";
    }

    public Long getId() {
        return id;
    }

    public CustomerOrder getOrder() {
        return order;
    }

    public Product getProduct() {
        return product;
    }

    public String getLocationCode() {
        return locationCode;
    }

    public Integer getQuantityToPick() {
        return quantityToPick;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
