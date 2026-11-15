package pl.dobregary.repository;

import pl.dobregary.model.ProductStockSummary;

import java.util.List;
import java.util.Optional;

public interface ProductStockSummaryRepository extends ReadOnlyRepository<ProductStockSummary, Long> {

    Optional<ProductStockSummary> findBySku(String sku);

    List<ProductStockSummary> findByBrandIgnoreCase(String brand);

    List<ProductStockSummary> findByTotalStockLessThanOrderByTotalStockAsc(Integer threshold);
}
