package pl.dobregary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddressRequest(
        @NotBlank(message = "Recipient name is required")
        @Size(max = 150)
        String recipientName,

        @NotBlank(message = "Street line 1 is required")
        @Size(max = 255)
        String streetLine1,

        @Size(max = 255)
        @Pattern(regexp = ".*\\S.*", flags = Pattern.Flag.DOTALL, message = "Street line 2 cannot be blank if provided")
        String streetLine2,

        @NotBlank(message = "City is required")
        @Size(max = 100)
        String city,

        @NotBlank(message = "State or province is required")
        @Size(max = 100)
        String stateProvince,

        @NotBlank(message = "Postal code is required")
        @Size(max = 20)
        @Pattern(regexp = "^[0-9]{2}-[0-9]{3}$", message = "Postal code must follow XX-XXX format")
        String postalCode
) {
}
