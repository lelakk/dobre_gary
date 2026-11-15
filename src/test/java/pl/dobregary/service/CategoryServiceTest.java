package pl.dobregary.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.dobregary.dto.CategoryRequest;
import pl.dobregary.dto.CategoryResponse;
import pl.dobregary.exception.ResourceNotFoundException;
import pl.dobregary.model.Category;
import pl.dobregary.repository.CategoryRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void createsSubcategoryWithParent() {
        Category parent = new Category();
        parent.setCategoryId(1);
        parent.setName("Garnki");

        when(categoryRepository.findById(1)).thenReturn(Optional.of(parent));
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category saved = invocation.getArgument(0);
            saved.setCategoryId(2);
            return saved;
        });

        CategoryResponse response = categoryService.createCategory(new CategoryRequest(1, "  Zestawy garnkow  "));

        assertEquals(2, response.categoryId());
        assertEquals(1, response.parentId());
        assertEquals("Garnki", response.parentName());
        assertEquals("Zestawy garnkow", response.name());
    }

    @Test
    void rejectsSelfParentAndCircularHierarchy() {
        Category root = new Category();
        root.setCategoryId(1);
        root.setName("Garnki");

        Category child = new Category();
        child.setCategoryId(2);
        child.setParent(root);
        child.setName("Zestawy");

        when(categoryRepository.findById(1)).thenReturn(Optional.of(root));
        when(categoryRepository.findById(2)).thenReturn(Optional.of(child));

        assertThrows(IllegalArgumentException.class,
                () -> categoryService.updateCategory(1, new CategoryRequest(1, "Garnki")));
        assertThrows(IllegalArgumentException.class,
                () -> categoryService.updateCategory(1, new CategoryRequest(2, "Garnki")));
    }

    @Test
    void throwsWhenDeletingMissingCategory() {
        when(categoryRepository.existsById(99)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> categoryService.deleteCategory(99));
    }
}
