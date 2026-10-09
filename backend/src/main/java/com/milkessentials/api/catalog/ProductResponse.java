package com.milkessentials.api.catalog;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        Long categoryId,
        String sku,
        String name,
        String description,
        String unit,
        BigDecimal price,
        String imageUrl,
        boolean available,
        Integer stockQuantity) {

    public static ProductResponse from(Product product) {
        Long categoryId = product.getCategory() == null
                ? null
                : product.getCategory().getId();

        return new ProductResponse(
                product.getId(),
                categoryId,
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getUnit(),
                product.getPrice(),
                product.getImageUrl(),
                product.isAvailable(),
                product.getStockQuantity());
    }
}
