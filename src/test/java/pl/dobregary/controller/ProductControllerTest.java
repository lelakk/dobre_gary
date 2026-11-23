package pl.dobregary.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pl.dobregary.dto.ProductRequest;
import pl.dobregary.dto.ProductResponse;
import pl.dobregary.exception.ConflictException;
import pl.dobregary.service.ProductService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    private static final String VALID_PRODUCT_JSON = """
            {
              "sku": "GAR-001",
              "name": "Garnek stalowy 5L",
              "brand": "Tefal",
              "basePrice": 199.99,
              "quantity": 12,
              "categoryIds": [1, 2]
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    @Test
    void listsAllProductsWhenNoNameFilterGiven() throws Exception {
        when(productService.getAllProducts()).thenReturn(List.of(sampleProduct(1L), sampleProduct(2L)));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));

        verify(productService, never()).searchByName(anyString());
    }

    @Test
    void searchesProductsByTrimmedName() throws Exception {
        when(productService.searchByName("garnek")).thenReturn(List.of(sampleProduct(1L)));

        mockMvc.perform(get("/api/products").param("name", "  garnek "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("GAR-001"));
    }

    @Test
    void returnsStockSummaryFromView() throws Exception {
        when(productService.getAllStockSummaries()).thenReturn(List.of());

        mockMvc.perform(get("/api/products/stock-summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        verify(productService).getAllStockSummaries();
    }

    @Test
    void createsProductWithCreatedStatus() throws Exception {
        when(productService.createProduct(any(ProductRequest.class))).thenReturn(sampleProduct(7L));

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_PRODUCT_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productId").value(7))
                .andExpect(jsonPath("$.quantity").value(12));
    }

    @Test
    void rejectsInvalidProductPayload() throws Exception {
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"sku": "GAR-001", "name": "Garnek", "brand": "Tefal", "basePrice": 0, "quantity": -1}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.basePrice").value("Base price must be greater than 0"))
                .andExpect(jsonPath("$.fieldErrors.quantity").value("Quantity cannot be negative"));

        verify(productService, never()).createProduct(any());
    }

    @Test
    void mapsDuplicateSkuToConflict() throws Exception {
        when(productService.updateProduct(eq(1L), any(ProductRequest.class)))
                .thenThrow(new ConflictException("Product with SKU already exists: GAR-001"));

        mockMvc.perform(put("/api/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_PRODUCT_JSON))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Product with SKU already exists: GAR-001"));
    }

    @Test
    void deletesProductWithNoContent() throws Exception {
        mockMvc.perform(delete("/api/products/3"))
                .andExpect(status().isNoContent());

        verify(productService).deleteProduct(3L);
    }

    private ProductResponse sampleProduct(Long id) {
        return new ProductResponse(
                id,
                "GAR-001",
                "Garnek stalowy 5L",
                "Tefal",
                null,
                new BigDecimal("199.99"),
                12,
                Set.of(1, 2),
                LocalDateTime.of(2026, 1, 15, 10, 30)
        );
    }
}
