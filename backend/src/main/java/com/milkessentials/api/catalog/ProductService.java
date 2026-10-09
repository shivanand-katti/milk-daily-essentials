package com.milkessentials.api.catalog;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Page<ProductResponse> listAvailable(
            Long categoryId, String search, int page, int size) {
        String normalizedSearch = search == null ? "" : search.trim();
        return productRepository.searchAvailable(
                        categoryId,
                        normalizedSearch,
                        PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name")))
                .map(ProductResponse::from);
    }

    public ProductResponse getAvailableById(Long id) {
        Product product = productRepository.findByIdAndAvailableTrue(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));
        return ProductResponse.from(product);
    }
}
