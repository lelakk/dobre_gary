package pl.dobregary.dto;

import pl.dobregary.model.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long orderId,
        Long userId,
        String customerEmail,
        Long shippingAddressId,
        Long billingAddressId,
        OrderStatus orderStatus,
        BigDecimal totalAmount,
        LocalDateTime createdAt,
        List<OrderItemResponse> items
) {
}
