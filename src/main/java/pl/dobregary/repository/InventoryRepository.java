package pl.dobregary.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.dobregary.model.Inventory;

import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findByQuantityLessThan(Integer threshold);
}
