package pl.dobregary.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.Set;

public record ProductRequest(
        @NotBlank(message = "SKU is required")
        @Size(max = 64)
        @Pattern(regexp = "^[A-Za-z0-9][A-Za-z0-9_-]*$", message = "Invalid SKU format")
        String sku,

        @NotBlank(message = "Product name is required")
        @Size(max = 200)
        String name,

        @NotBlank(message = "Brand is required")
        @Size(max = 100)
        String brand,

        @Pattern(regexp = ".*\\S.*", flags = Pattern.Flag.DOTALL, message = "Description cannot be blank if provided")
        String description,

        @NotNull(message = "Base price is required")
        @DecimalMin(value = "0.01", message = "Base price must be greater than 0")
        @Digits(integer = 8, fraction = 2)
        BigDecimal basePrice,

        @Min(value = 0, message = "Quantity cannot be negative")
        Integer quantity,

        Set<Integer> categoryIds
) {
}
