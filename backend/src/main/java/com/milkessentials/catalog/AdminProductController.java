package com.milkessentials.catalog;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/products")
@CrossOrigin(origins = "*", allowedHeaders = {"Content-Type", "Authorization"},
        methods = {org.springframework.web.bind.annotation.RequestMethod.GET,
                   org.springframework.web.bind.annotation.RequestMethod.POST,
                   org.springframework.web.bind.annotation.RequestMethod.PUT,
                   org.springframework.web.bind.annotation.RequestMethod.DELETE,
                   org.springframework.web.bind.annotation.RequestMethod.OPTIONS})
public class AdminProductController {

    private final ProductRepository productRepository;

    public AdminProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<ProductResponse> listAll() {
        return productRepository.findAll(Sort.by(Sort.Direction.ASC, "name"))
                .stream().map(ProductResponse::from).toList();
    }

    @PostMapping
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        if (productRepository.existsBySkuIgnoreCase(request.sku().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A product with this SKU already exists. Choose a unique SKU.");
        }
        Product product = new Product();
        request.applyTo(product);
        return ProductResponse.from(productRepository.save(product));
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (productRepository.existsBySkuIgnoreCase(request.sku().trim())
                && !product.getSku().equalsIgnoreCase(request.sku().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A product with this SKU already exists. Choose a unique SKU.");
        }
        request.applyTo(product);
        return ProductResponse.from(productRepository.save(product));
    }

    @DeleteMapping("/{id}")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepository.deleteById(id);
    }

}
