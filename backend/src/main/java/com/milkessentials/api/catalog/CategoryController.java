package com.milkessentials.api.catalog;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<CategoryResponse> listActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(CategoryResponse::from)
                .toList();
    }

    public record CategoryResponse(Long id, String name, String slug, String description) {
        static CategoryResponse from(Category category) {
            return new CategoryResponse(
                    category.getId(),
                    category.getName(),
                    category.getSlug(),
                    category.getDescription());
        }
    }
}
