package pl.dobregary.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import pl.dobregary.dto.OrderResponse;
import pl.dobregary.dto.QuickOrderRequest;
import pl.dobregary.model.Address;
import pl.dobregary.model.Order;
import pl.dobregary.model.OrderItem;
import pl.dobregary.model.Product;
import pl.dobregary.model.User;
import pl.dobregary.model.enums.OrderStatus;
import pl.dobregary.model.enums.PaymentMethod;
import pl.dobregary.repository.AddressRepository;
import pl.dobregary.repository.OrderItemRepository;
import pl.dobregary.repository.OrderRepository;
import pl.dobregary.repository.UserRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AddressRepository addressRepository;

    private Long stubbedProcedureOrderId;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        stubbedProcedureOrderId = 11L;
        orderService = new OrderService(
                orderRepository,
                orderItemRepository,
                userRepository,
                addressRepository,
                new JdbcTemplate()
        ) {
            @Override
            protected Long executePlaceOrderProcedure(QuickOrderRequest request) {
                return stubbedProcedureOrderId;
            }
        };
    }

    @Test
    void rejectsQuickOrderWhenAddressDoesNotBelongToUser() {
        when(userRepository.existsById(4L)).thenReturn(true);
        when(addressRepository.findByAddressIdAndUserUserId(99L, 4L)).thenReturn(Optional.empty());

        QuickOrderRequest request = new QuickOrderRequest(4L, 99L, 4L, 1L, 2, PaymentMethod.BLIK);

        assertThrows(IllegalArgumentException.class, () -> orderService.placeSingleProductOrder(request));
    }

    @Test
    void placesQuickOrderThroughStoredProcedureAndReturnsDetails() {
        User user = new User();
        user.setUserId(4L);
        user.setEmail("maria.wojcik@example.com");

        Address address = new Address();
        address.setAddressId(4L);
        address.setUser(user);

        Product product = new Product();
        product.setProductId(1L);
        product.setSku("GAR-001");
        product.setName("Zestaw garnkow");

        Order order = new Order();
        order.setOrderId(11L);
        order.setUser(user);
        order.setShippingAddress(address);
        order.setBillingAddress(address);
        order.setOrderStatus(OrderStatus.PENDING);
        order.setTotalAmount(new BigDecimal("799.98"));

        OrderItem item = new OrderItem();
        item.setOrderItemId(15L);
        item.setOrder(order);
        item.setProduct(product);
        item.setQuantity(2);
        item.setUnitPrice(new BigDecimal("399.99"));

        QuickOrderRequest request = new QuickOrderRequest(4L, 4L, 4L, 1L, 2, PaymentMethod.BLIK);

        when(userRepository.existsById(4L)).thenReturn(true);
        when(addressRepository.findByAddressIdAndUserUserId(4L, 4L)).thenReturn(Optional.of(address));
        when(orderRepository.findById(11L)).thenReturn(Optional.of(order));
        when(orderItemRepository.findByOrderOrderId(11L)).thenReturn(List.of(item));

        OrderResponse response = orderService.placeSingleProductOrder(request);

        assertEquals(11L, response.orderId());
        assertEquals(OrderStatus.PENDING, response.orderStatus());
        assertEquals(1, response.items().size());
        assertEquals("GAR-001", response.items().getFirst().productSku());
    }
}
