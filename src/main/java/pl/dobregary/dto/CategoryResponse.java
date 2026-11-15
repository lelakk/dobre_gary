package pl.dobregary.dto;

public record CategoryResponse(
        Integer categoryId,
        Integer parentId,
        String parentName,
        String name
) {
}
