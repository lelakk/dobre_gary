package pl.dobregary.dto;

import java.time.LocalDateTime;

public record AddressResponse(
        Long addressId,
        Long userId,
        String recipientName,
        String streetLine1,
        String streetLine2,
        String city,
        String stateProvince,
        String postalCode,
        LocalDateTime createdAt
) {
}
