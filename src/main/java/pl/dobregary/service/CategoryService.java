package pl.dobregary.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.dobregary.dto.CategoryRequest;
import pl.dobregary.dto.CategoryResponse;
import pl.dobregary.exception.ResourceNotFoundException;
import pl.dobregary.model.Category;
import pl.dobregary.repository.CategoryRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll(Sort.by("name").ascending()).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIsNullOrderByNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CategoryResponse> getSubcategories(Integer parentId) {
        findEntity(parentId);
        return categoryRepository.findByParentCategoryIdOrderByNameAsc(parentId).stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse getCategoryById(Integer id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setParent(resolveParent(request.parentId(), null));
        category.setName(request.name().trim());
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Integer id, CategoryRequest request) {
        Category category = findEntity(id);
        category.setParent(resolveParent(request.parentId(), id));
        category.setName(request.name().trim());
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Integer id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private Category findEntity(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private Category resolveParent(Integer parentId, Integer currentCategoryId) {
        if (parentId == null) {
            return null;
        }
        if (parentId.equals(currentCategoryId)) {
            throw new IllegalArgumentException("Category cannot be its own parent");
        }
        Category parent = findEntity(parentId);
        if (currentCategoryId != null && createsHierarchyCycle(parent, currentCategoryId)) {
            throw new IllegalArgumentException("Circular category hierarchy is not allowed");
        }
        return parent;
    }

    private boolean createsHierarchyCycle(Category candidateParent, Integer currentCategoryId) {
        Category cursor = candidateParent;
        while (cursor != null) {
            if (currentCategoryId.equals(cursor.getCategoryId())) {
                return true;
            }
            cursor = cursor.getParent();
        }
        return false;
    }

    private CategoryResponse toResponse(Category category) {
        Category parent = category.getParent();
        return new CategoryResponse(
                category.getCategoryId(),
                parent != null ? parent.getCategoryId() : null,
                parent != null ? parent.getName() : null,
                category.getName()
        );
    }
}
