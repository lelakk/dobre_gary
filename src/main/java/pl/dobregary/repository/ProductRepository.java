package pl.dobregary.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.dobregary.model.Product;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    List<Product> findByBrandIgnoreCase(String brand);

    List<Product> findByNameContainingIgnoreCase(String nameFragment);

    List<Product> findByCategoriesCategoryId(Integer categoryId);
}
