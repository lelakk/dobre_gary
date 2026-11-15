package pl.dobregary.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.dobregary.dto.ProductRequest;
import pl.dobregary.dto.ProductResponse;
import pl.dobregary.exception.ConflictException;
import pl.dobregary.model.Category;
import pl.dobregary.model.Inventory;
import pl.dobregary.model.Product;
import pl.dobregary.repository.CategoryRepository;
import pl.dobregary.repository.InventoryRepository;
import pl.dobregary.repository.ProductRepository;
import pl.dobregary.repository.ProductStockSummaryRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductStockSummaryRepository stockSummaryRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void createsProductWithInitialInventoryAndCategories() {
        Category category = new Category();
        category.setCategoryId(1);
        category.setName("Garnki");

        when(productRepository.existsBySku("GAR-100")).thenReturn(false);
        when(categoryRepository.findAllById(Set.of(1))).thenReturn(List.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product saved = invocation.getArgument(0);
            saved.setProductId(10L);
            return saved;
        });
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductRequest request = new ProductRequest(
                "GAR-100",
                "Garnek stalowy",
                "Gerlach",
                "Opis garnka",
                new BigDecimal("299.99"),
                15,
                Set.of(1)
        );

        ProductResponse response = productService.createProduct(request);

        assertEquals(10L, response.productId());
        assertEquals("GAR-100", response.sku());
        assertEquals(15, response.quantity());
        assertEquals(Set.of(1), response.categoryIds());
    }

    @Test
    void throwsConflictWhenSkuAlreadyExists() {
        when(productRepository.existsBySku("GAR-001")).thenReturn(true);

        ProductRequest request = new ProductRequest(
                "GAR-001",
                "Garnek",
                "Gerlach",
                null,
                new BigDecimal("100.00"),
                5,
                null
        );

        assertThrows(ConflictException.class, () -> productService.createProduct(request));
    }

    @Test
    void deletesInventoryBeforeProduct() {
        when(productRepository.existsById(10L)).thenReturn(true);
        when(inventoryRepository.existsById(10L)).thenReturn(true);

        productService.deleteProduct(10L);

        verify(inventoryRepository).deleteById(10L);
        verify(productRepository).deleteById(10L);
    }
}
