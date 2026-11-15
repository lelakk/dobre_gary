package pl.dobregary.dto;

import jakarta.validation.constraints.NotNull;
import pl.dobregary.model.enums.OrderStatus;

public record UpdateOrderStatusRequest(
        @NotNull(message = "Order status is required")
        OrderStatus orderStatus
) {
}
