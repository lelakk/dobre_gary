package pl.dobregary.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

public record ProductResponse(
        Long productId,
        String sku,
        String name,
        String brand,
        String description,
        BigDecimal basePrice,
        Integer quantity,
        Set<Integer> categoryIds,
        LocalDateTime createdAt
) {
}
