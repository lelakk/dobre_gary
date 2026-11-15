package pl.dobregary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        Integer parentId,
        @NotBlank(message = "Category name is required")
        @Size(max = 100)
        String name
) {
}
