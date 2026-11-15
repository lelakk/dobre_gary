package pl.dobregary.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlOutParameter;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.dobregary.dto.OrderItemResponse;
import pl.dobregary.dto.OrderResponse;
import pl.dobregary.dto.QuickOrderRequest;
import pl.dobregary.exception.ResourceNotFoundException;
import pl.dobregary.model.Order;
import pl.dobregary.model.OrderItem;
import pl.dobregary.model.enums.OrderStatus;
import pl.dobregary.repository.AddressRepository;
import pl.dobregary.repository.OrderItemRepository;
import pl.dobregary.repository.OrderRepository;
import pl.dobregary.repository.UserRepository;

import java.sql.Types;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        Map<Long, List<OrderItem>> itemsByOrderId = orderItemRepository.findAll().stream()
                .collect(Collectors.groupingBy(item -> item.getOrder().getOrderId()));
        return orderRepository.findAll(Sort.by("orderId").descending()).stream()
                .map(order -> toResponse(order, itemsByOrderId.getOrDefault(order.getOrderId(), List.of())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return orderRepository.findByUserUserIdOrderByCreatedAtDesc(userId).stream()
                .map(order -> toResponse(order, orderItemRepository.findByOrderOrderId(order.getOrderId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        Order order = findEntity(orderId);
        List<OrderItem> items = orderItemRepository.findByOrderOrderId(orderId);
        return toResponse(order, items);
    }

    public OrderResponse placeSingleProductOrder(QuickOrderRequest request) {
        validateOrderAddresses(request);
        Long newOrderId = executePlaceOrderProcedure(request);
        return getOrderById(newOrderId);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = findEntity(orderId);
        order.setOrderStatus(status);
        Order savedOrder = orderRepository.save(order);
        List<OrderItem> items = orderItemRepository.findByOrderOrderId(orderId);
        return toResponse(savedOrder, items);
    }

    protected Long executePlaceOrderProcedure(QuickOrderRequest request) {
        SimpleJdbcCall procedureCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_place_single_product_order")
                .withoutProcedureColumnMetaDataAccess()
                .declareParameters(
                        new SqlParameter("p_user_id", Types.BIGINT),
                        new SqlParameter("p_shipping_address_id", Types.BIGINT),
                        new SqlParameter("p_billing_address_id", Types.BIGINT),
                        new SqlParameter("p_product_id", Types.BIGINT),
                        new SqlParameter("p_quantity", Types.INTEGER),
                        new SqlParameter("p_payment_method", Types.VARCHAR),
                        new SqlOutParameter("p_new_order_id", Types.BIGINT)
                );

        MapSqlParameterSource parameters = new MapSqlParameterSource()
                .addValue("p_user_id", request.userId())
                .addValue("p_shipping_address_id", request.shippingAddressId())
                .addValue("p_billing_address_id", request.billingAddressId())
                .addValue("p_product_id", request.productId())
                .addValue("p_quantity", request.quantity())
                .addValue("p_payment_method", request.paymentMethod().getDatabaseValue());

        Map<String, Object> result = procedureCall.execute(parameters);
        Object orderId = result.get("p_new_order_id");
        if (orderId instanceof Number number) {
            return number.longValue();
        }
        throw new IllegalStateException("Stored procedure did not return a new order id");
    }

    private void validateOrderAddresses(QuickOrderRequest request) {
        if (!userRepository.existsById(request.userId())) {
            throw new ResourceNotFoundException("User not found with id: " + request.userId());
        }
        if (addressRepository.findByAddressIdAndUserUserId(request.shippingAddressId(), request.userId()).isEmpty()) {
            throw new IllegalArgumentException("Shipping address does not belong to user " + request.userId());
        }
        if (addressRepository.findByAddressIdAndUserUserId(request.billingAddressId(), request.userId()).isEmpty()) {
            throw new IllegalArgumentException("Billing address does not belong to user " + request.userId());
        }
    }

    private Order findEntity(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    }

    private OrderResponse toResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream()
                .map(item -> new OrderItemResponse(
                        item.getOrderItemId(),
                        item.getProduct().getProductId(),
                        item.getProduct().getSku(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getUnitPrice()
                ))
                .toList();

        return new OrderResponse(
                order.getOrderId(),
                order.getUser().getUserId(),
                order.getUser().getEmail(),
                order.getShippingAddress().getAddressId(),
                order.getBillingAddress().getAddressId(),
                order.getOrderStatus(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                itemResponses
        );
    }
}
