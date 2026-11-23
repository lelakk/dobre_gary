package pl.dobregary.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pl.dobregary.dto.CategoryRequest;
import pl.dobregary.dto.CategoryResponse;
import pl.dobregary.exception.ResourceNotFoundException;
import pl.dobregary.service.CategoryService;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CategoryController.class)
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CategoryService categoryService;

    @Test
    void listsAllCategories() throws Exception {
        when(categoryService.getAllCategories()).thenReturn(List.of(
                new CategoryResponse(1, null, null, "Garnki"),
                new CategoryResponse(2, 1, "Garnki", "Zestawy garnkow")
        ));

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[1].parentName").value("Garnki"));
    }

    @Test
    void listsSubcategories() throws Exception {
        when(categoryService.getSubcategories(1)).thenReturn(List.of(
                new CategoryResponse(2, 1, "Garnki", "Zestawy garnkow")
        ));

        mockMvc.perform(get("/api/categories/1/subcategories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].categoryId").value(2));
    }

    @Test
    void createsCategoryWithCreatedStatus() throws Exception {
        when(categoryService.createCategory(any(CategoryRequest.class)))
                .thenReturn(new CategoryResponse(3, null, null, "Patelnie"));

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Patelnie"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.categoryId").value(3))
                .andExpect(jsonPath("$.name").value("Patelnie"));
    }

    @Test
    void rejectsBlankCategoryName() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "  "}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").value("Category name is required"));

        verify(categoryService, never()).createCategory(any());
    }

    @Test
    void mapsCircularHierarchyToBadRequest() throws Exception {
        when(categoryService.updateCategory(eq(1), any(CategoryRequest.class)))
                .thenThrow(new IllegalArgumentException("Circular category hierarchy is not allowed"));

        mockMvc.perform(put("/api/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"parentId": 2, "name": "Garnki"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Circular category hierarchy is not allowed"));
    }

    @Test
    void returnsNotFoundForMissingCategory() throws Exception {
        when(categoryService.getCategoryById(99))
                .thenThrow(new ResourceNotFoundException("Category not found with id: 99"));

        mockMvc.perform(get("/api/categories/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Category not found with id: 99"));
    }

    @Test
    void deletesCategoryWithNoContent() throws Exception {
        mockMvc.perform(delete("/api/categories/5"))
                .andExpect(status().isNoContent());

        verify(categoryService).deleteCategory(5);
    }

    @Test
    void returnsNotFoundWhenDeletingMissingCategory() throws Exception {
        doThrow(new ResourceNotFoundException("Category not found with id: 99"))
                .when(categoryService).deleteCategory(99);

        mockMvc.perform(delete("/api/categories/99"))
                .andExpect(status().isNotFound());
    }
}
