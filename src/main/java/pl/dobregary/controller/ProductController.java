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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pl.dobregary.dto.ProductRequest;
import pl.dobregary.dto.ProductResponse;
import pl.dobregary.model.ProductStockSummary;
import pl.dobregary.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "CRUD for products together with their inventory")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "List products, optionally filtered by a name fragment")
    public List<ProductResponse> getProducts(@RequestParam(required = false) String name) {
        if (name == null || name.isBlank()) {
            return productService.getAllProducts();
        }
        return productService.searchByName(name.trim());
    }

    @GetMapping("/stock-summary")
    @Operation(summary = "Stock summary read from the v_product_stock_summary SQL view")
    public List<ProductStockSummary> getStockSummary() {
        return productService.getAllStockSummaries();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a product with its current stock")
    public ProductResponse getProduct(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a product and its inventory record in one transaction")
    public ProductResponse createProduct(@Valid @RequestBody ProductRequest request) {
        return productService.createProduct(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product data, categories and (optionally) stock quantity")
    public ProductResponse updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a product together with its inventory record")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}
