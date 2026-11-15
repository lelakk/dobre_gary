package pl.dobregary.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.dobregary.dto.ProductRequest;
import pl.dobregary.dto.ProductResponse;
import pl.dobregary.exception.ConflictException;
import pl.dobregary.exception.ResourceNotFoundException;
import pl.dobregary.model.Category;
import pl.dobregary.model.Inventory;
import pl.dobregary.model.Product;
import pl.dobregary.model.ProductStockSummary;
import pl.dobregary.repository.CategoryRepository;
import pl.dobregary.repository.InventoryRepository;
import pl.dobregary.repository.ProductRepository;
import pl.dobregary.repository.ProductStockSummaryRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CategoryRepository categoryRepository;
    private final ProductStockSummaryRepository stockSummaryRepository;

    public List<ProductStockSummary> getAllStockSummaries() {
        return stockSummaryRepository.findAll(Sort.by("productId").ascending());
    }

    public List<ProductResponse> getAllProducts() {
        Map<Long, Integer> quantitiesByProductId = loadQuantitiesMap();
        return productRepository.findAll(Sort.by("productId").ascending()).stream()
                .map(product -> toResponse(product, quantitiesByProductId.getOrDefault(product.getProductId(), 0)))
                .toList();
    }

    public ProductResponse getProductById(Long id) {
        Product product = findEntity(id);
        int quantity = inventoryRepository.findById(id)
                .map(Inventory::getQuantity)
                .orElse(0);
        return toResponse(product, quantity);
    }

    public List<ProductResponse> searchByName(String nameFragment) {
        Map<Long, Integer> quantitiesByProductId = loadQuantitiesMap();
        return productRepository.findByNameContainingIgnoreCase(nameFragment).stream()
                .map(product -> toResponse(product, quantitiesByProductId.getOrDefault(product.getProductId(), 0)))
                .toList();
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        String normalizedSku = request.sku().trim();
        if (productRepository.existsBySku(normalizedSku)) {
            throw new ConflictException("Product with SKU already exists: " + normalizedSku);
        }

        Product product = new Product();
        applyRequestFields(product, request, normalizedSku);
        Product savedProduct = productRepository.save(product);

        Inventory inventory = new Inventory();
        inventory.setProduct(savedProduct);
        inventory.setQuantity(request.quantity() != null ? request.quantity() : 0);
        Inventory savedInventory = inventoryRepository.save(inventory);

        return toResponse(savedProduct, savedInventory.getQuantity());
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product existing = findEntity(id);
        String normalizedSku = request.sku().trim();
        if (!existing.getSku().equals(normalizedSku) && productRepository.existsBySku(normalizedSku)) {
            throw new ConflictException("Product with SKU already exists: " + normalizedSku);
        }

        applyRequestFields(existing, request, normalizedSku);
        Product savedProduct = productRepository.save(existing);

        int quantity = updateInventoryQuantity(savedProduct, request.quantity());
        return toResponse(savedProduct, quantity);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        if (inventoryRepository.existsById(id)) {
            inventoryRepository.deleteById(id);
        }
        productRepository.deleteById(id);
    }

    private Product findEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private void applyRequestFields(Product product, ProductRequest request, String normalizedSku) {
        product.setSku(normalizedSku);
        product.setName(request.name().trim());
        product.setBrand(request.brand().trim());
        product.setDescription(request.description() != null ? request.description().trim() : null);
        product.setBasePrice(request.basePrice());
        product.setCategories(resolveCategories(request.categoryIds()));
    }

    private Set<Category> resolveCategories(Set<Integer> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return new HashSet<>();
        }
        List<Category> categories = categoryRepository.findAllById(categoryIds);
        if (categories.size() != categoryIds.size()) {
            throw new ResourceNotFoundException("One or more categories not found");
        }
        return new HashSet<>(categories);
    }

    private int updateInventoryQuantity(Product product, Integer newQuantity) {
        Inventory inventory = inventoryRepository.findById(product.getProductId()).orElseGet(() -> {
            Inventory created = new Inventory();
            created.setProduct(product);
            created.setQuantity(0);
            return created;
        });
        if (newQuantity != null) {
            inventory.setQuantity(newQuantity);
            inventoryRepository.save(inventory);
        }
        return inventory.getQuantity();
    }

    private Map<Long, Integer> loadQuantitiesMap() {
        return inventoryRepository.findAll().stream()
                .collect(Collectors.toMap(Inventory::getProductId, Inventory::getQuantity));
    }

    private ProductResponse toResponse(Product product, int quantity) {
        Set<Integer> categoryIds = product.getCategories().stream()
                .map(Category::getCategoryId)
                .collect(Collectors.toSet());
        return new ProductResponse(
                product.getProductId(),
                product.getSku(),
                product.getName(),
                product.getBrand(),
                product.getDescription(),
                product.getBasePrice(),
                quantity,
                categoryIds,
                product.getCreatedAt()
        );
    }
}
