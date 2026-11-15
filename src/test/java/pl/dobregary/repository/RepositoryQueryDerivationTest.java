package pl.dobregary.repository;

import org.junit.jupiter.api.Test;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.parser.PartTree;
import pl.dobregary.model.Address;
import pl.dobregary.model.Category;
import pl.dobregary.model.Inventory;
import pl.dobregary.model.Order;
import pl.dobregary.model.OrderItem;
import pl.dobregary.model.Payment;
import pl.dobregary.model.Product;
import pl.dobregary.model.ProductStockSummary;
import pl.dobregary.model.Shipment;
import pl.dobregary.model.User;

import java.lang.reflect.Method;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RepositoryQueryDerivationTest {

    private static final Map<Class<?>, Class<?>> REPOSITORY_ENTITIES = Map.ofEntries(
            Map.entry(UserRepository.class, User.class),
            Map.entry(AddressRepository.class, Address.class),
            Map.entry(CategoryRepository.class, Category.class),
            Map.entry(ProductRepository.class, Product.class),
            Map.entry(InventoryRepository.class, Inventory.class),
            Map.entry(ProductStockSummaryRepository.class, ProductStockSummary.class),
            Map.entry(OrderRepository.class, Order.class),
            Map.entry(OrderItemRepository.class, OrderItem.class),
            Map.entry(PaymentRepository.class, Payment.class),
            Map.entry(ShipmentRepository.class, Shipment.class)
    );

    @Test
    void allDerivedRepositoryQueryMethodsResolveValidEntityProperties() {
        for (Map.Entry<Class<?>, Class<?>> entry : REPOSITORY_ENTITIES.entrySet()) {
            Class<?> repositoryInterface = entry.getKey();
            Class<?> entityClass = entry.getValue();

            for (Method method : repositoryInterface.getDeclaredMethods()) {
                assertDoesNotThrow(
                        () -> new PartTree(method.getName(), entityClass),
                        () -> "Invalid derived query method " + repositoryInterface.getSimpleName() + "." + method.getName()
                );
            }
        }
    }

    @Test
    void stockSummaryViewRepositoryIsReadOnly() {
        assertTrue(ReadOnlyRepository.class.isAssignableFrom(ProductStockSummaryRepository.class));
        assertFalse(CrudRepository.class.isAssignableFrom(ProductStockSummaryRepository.class));
    }
}
