package pl.dobregary.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.dobregary.model.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Integer> {

    List<Category> findByParentIsNullOrderByNameAsc();

    List<Category> findByParentCategoryIdOrderByNameAsc(Integer parentId);

    Optional<Category> findByNameIgnoreCase(String name);
}
