package com.milkessentials.catalog;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/products")
@CrossOrigin(origins = "*", allowedHeaders = {"Content-Type", "X-Admin-Api-Key"},
        methods = {org.springframework.web.bind.annotation.RequestMethod.GET,
                   org.springframework.web.bind.annotation.RequestMethod.POST,
                   org.springframework.web.bind.annotation.RequestMethod.PUT,
                   org.springframework.web.bind.annotation.RequestMethod.DELETE,
                   org.springframework.web.bind.annotation.RequestMethod.OPTIONS})
public class AdminProductController {

    private static final String ADMIN_KEY_HEADER = "X-Admin-Api-Key";

    private final ProductRepository productRepository;
    private final String configuredAdminKey;

    public AdminProductController(ProductRepository productRepository,
            @Value("${app.admin-api-key:}") String configuredAdminKey) {
        this.productRepository = productRepository;
        this.configuredAdminKey = configuredAdminKey;
    }

    @GetMapping
    public List<ProductResponse> listAll(@RequestHeader(value = ADMIN_KEY_HEADER, required = false) String key) {
        requireAdminKey(key);
        return productRepository.findAll(Sort.by(Sort.Direction.ASC, "name"))
                .stream().map(ProductResponse::from).toList();
    }

    @PostMapping
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@RequestHeader(value = ADMIN_KEY_HEADER, required = false) String key,
                                  @Valid @RequestBody ProductRequest request) {
        requireAdminKey(key);
        Product product = new Product();
        request.applyTo(product);
        return ProductResponse.from(productRepository.save(product));
    }

    @PutMapping("/{id}")
    public ProductResponse update(@RequestHeader(value = ADMIN_KEY_HEADER, required = false) String key,
                                  @PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        requireAdminKey(key);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        request.applyTo(product);
        return ProductResponse.from(productRepository.save(product));
    }

    @DeleteMapping("/{id}")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(value = ADMIN_KEY_HEADER, required = false) String key,
                       @PathVariable Long id) {
        requireAdminKey(key);
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepository.deleteById(id);
    }

    private void requireAdminKey(String suppliedKey) {
        if (configuredAdminKey == null || configuredAdminKey.isBlank()
                || suppliedKey == null || suppliedKey.isBlank()
                || !MessageDigest.isEqual(
                        configuredAdminKey.getBytes(StandardCharsets.UTF_8),
                        suppliedKey.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "A valid admin API key is required");
        }
    }
}
