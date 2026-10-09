package com.milkessentials.api.catalog;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products")
@Validated
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public PageResponse<ProductResponse> listProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @Size(max = 100) String search,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {

        Page<ProductResponse> results =
                productService.listAvailable(categoryId, search, page, size);
        return PageResponse.from(results);
    }

    @GetMapping("/{id}")
    public ProductResponse getProduct(@PathVariable @Min(1) Long id) {
        return productService.getAvailableById(id);
    }
}
