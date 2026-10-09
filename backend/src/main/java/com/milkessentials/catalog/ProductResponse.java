package com.milkessentials.catalog;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String sku,
        String name,
        String description,
        String unit,
        BigDecimal price,
        String imageUrl,
        boolean available,
        Long stockQuantity
) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getUnit(),
                product.getPrice(),
                product.getImageUrl(),
                product.isAvailable(),
                product.getStockQuantity()
        );
    }
}
