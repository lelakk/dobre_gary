package pl.dobregary.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pl.dobregary.dto.OrderResponse;
import pl.dobregary.dto.QuickOrderRequest;
import pl.dobregary.dto.UpdateOrderStatusRequest;
import pl.dobregary.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order browsing, quick ordering via stored procedure and status changes")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "List orders (newest first), optionally only for a given user")
    public List<OrderResponse> getOrders(@RequestParam(required = false) Long userId) {
        if (userId == null) {
            return orderService.getAllOrders();
        }
        return orderService.getOrdersForUser(userId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details with its items")
    public OrderResponse getOrder(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @PostMapping("/quick")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Place a single-product order via the sp_place_single_product_order stored procedure",
            description = "Stock checks, inventory decrement, order total and payment record are handled "
                    + "by the procedure and order_items triggers in the database.")
    public OrderResponse placeQuickOrder(@Valid @RequestBody QuickOrderRequest request) {
        return orderService.placeSingleProductOrder(request);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Change the status of an order")
    public OrderResponse updateOrderStatus(@PathVariable Long id,
                                           @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateOrderStatus(id, request.orderStatus());
    }
}
