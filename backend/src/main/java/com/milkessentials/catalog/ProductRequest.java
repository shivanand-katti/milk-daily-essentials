package com.milkessentials.catalog;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank @Size(max = 64) String sku,
        @NotBlank @Size(max = 180) String name,
        @Size(max = 10000) String description,
        @NotBlank @Size(max = 40) String unit,
        @NotNull @DecimalMin("0.00") BigDecimal price,
        @Size(max = 1000) String imageUrl,
        boolean available,
        @PositiveOrZero Integer stockQuantity
) {
    public void applyTo(Product product) {
        product.setSku(sku.trim());
        product.setName(name.trim());
        product.setDescription(blankToNull(description));
        product.setUnit(unit.trim());
        product.setPrice(price);
        product.setImageUrl(blankToNull(imageUrl));
        product.setAvailable(available);
        product.setStockQuantity(stockQuantity);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
