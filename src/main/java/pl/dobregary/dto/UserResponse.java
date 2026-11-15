package pl.dobregary.dto;

import java.time.LocalDateTime;

public record UserResponse(
        Long userId,
        String email,
        String firstName,
        String lastName,
        String phone,
        LocalDateTime createdAt
) {
}
