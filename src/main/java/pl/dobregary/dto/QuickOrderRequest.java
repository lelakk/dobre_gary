package pl.dobregary.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import pl.dobregary.model.enums.PaymentMethod;

public record QuickOrderRequest(
        @NotNull(message = "User ID is required")
        Long userId,

        @NotNull(message = "Shipping address ID is required")
        Long shippingAddressId,

        @NotNull(message = "Billing address ID is required")
        Long billingAddressId,

        @NotNull(message = "Product ID is required")
        Long productId,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity,

        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod
) {
}
