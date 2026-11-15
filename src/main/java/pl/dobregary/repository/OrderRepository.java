package pl.dobregary.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.dobregary.model.Order;
import pl.dobregary.model.enums.OrderStatus;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByOrderStatusOrderByCreatedAtDesc(OrderStatus orderStatus);
}
