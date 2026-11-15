package pl.dobregary.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long orderItemId,
        Long productId,
        String productSku,
        String productName,
        Integer quantity,
        BigDecimal unitPrice
) {
}
