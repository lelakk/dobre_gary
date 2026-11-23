package pl.dobregary.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pl.dobregary.dto.CategoryRequest;
import pl.dobregary.dto.CategoryResponse;
import pl.dobregary.service.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "CRUD for the product category hierarchy")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "List all categories sorted by name")
    public List<CategoryResponse> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/roots")
    @Operation(summary = "List top-level categories (without a parent)")
    public List<CategoryResponse> getRootCategories() {
        return categoryService.getRootCategories();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a category by id")
    public CategoryResponse getCategory(@PathVariable Integer id) {
        return categoryService.getCategoryById(id);
    }

    @GetMapping("/{id}/subcategories")
    @Operation(summary = "List direct subcategories of a category")
    public List<CategoryResponse> getSubcategories(@PathVariable Integer id) {
        return categoryService.getSubcategories(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a category, optionally under a parent")
    public CategoryResponse createCategory(@Valid @RequestBody CategoryRequest request) {
        return categoryService.createCategory(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Rename a category or move it under another parent")
    public CategoryResponse updateCategory(@PathVariable Integer id, @Valid @RequestBody CategoryRequest request) {
        return categoryService.updateCategory(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a category")
    public void deleteCategory(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
    }
}
