package pl.dobregary.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.UncategorizedSQLException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pl.dobregary.dto.OrderItemResponse;
import pl.dobregary.dto.OrderResponse;
import pl.dobregary.dto.QuickOrderRequest;
import pl.dobregary.model.enums.OrderStatus;
import pl.dobregary.model.enums.PaymentMethod;
import pl.dobregary.service.OrderService;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
class OrderControllerTest {

    private static final String QUICK_ORDER_JSON = """
            {
              "userId": 1,
              "shippingAddressId": 10,
              "billingAddressId": 10,
              "productId": 3,
              "quantity": 2,
              "paymentMethod": "blik"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderService orderService;

    @Test
    void listsAllOrdersWhenNoUserFilterGiven() throws Exception {
        when(orderService.getAllOrders()).thenReturn(List.of(sampleOrder(OrderStatus.PENDING)));

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].orderStatus").value("pending"))
                .andExpect(jsonPath("$[0].items[0].productSku").value("GAR-001"));

        verify(orderService, never()).getOrdersForUser(anyLong());
    }

    @Test
    void listsOrdersOfSingleUser() throws Exception {
        when(orderService.getOrdersForUser(1L)).thenReturn(List.of(sampleOrder(OrderStatus.PAID)));

        mockMvc.perform(get("/api/orders").param("userId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(1));

        verify(orderService, never()).getAllOrders();
    }

    @Test
    void placesQuickOrderWithLowercasePaymentMethod() throws Exception {
        when(orderService.placeSingleProductOrder(any(QuickOrderRequest.class)))
                .thenReturn(sampleOrder(OrderStatus.PENDING));

        mockMvc.perform(post("/api/orders/quick")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(QUICK_ORDER_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value(100))
                .andExpect(jsonPath("$.totalAmount").value(399.98));

        verify(orderService).placeSingleProductOrder(argThat(request ->
                request.paymentMethod() == PaymentMethod.BLIK && request.quantity() == 2));
    }

    @Test
    void returnsTriggerMessageWhenStockIsInsufficient() throws Exception {
        SQLException triggerError = new SQLException("Błąd: Niewystarczająca ilość dostępnego produktu!", "45000", 1644);
        when(orderService.placeSingleProductOrder(any(QuickOrderRequest.class)))
                .thenThrow(new UncategorizedSQLException("CallableStatement", "{call sp_place_single_product_order}", triggerError));

        mockMvc.perform(post("/api/orders/quick")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(QUICK_ORDER_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Błąd: Niewystarczająca ilość dostępnego produktu!"));
    }

    @Test
    void rejectsQuickOrderWithInvalidQuantity() throws Exception {
        mockMvc.perform(post("/api/orders/quick")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(QUICK_ORDER_JSON.replace("\"quantity\": 2", "\"quantity\": 0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.quantity").value("Quantity must be at least 1"));

        verify(orderService, never()).placeSingleProductOrder(any());
    }

    @Test
    void rejectsUnknownPaymentMethod() throws Exception {
        mockMvc.perform(post("/api/orders/quick")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(QUICK_ORDER_JSON.replace("blik", "bitcoin")))
                .andExpect(status().isBadRequest());

        verify(orderService, never()).placeSingleProductOrder(any());
    }

    @Test
    void updatesOrderStatus() throws Exception {
        when(orderService.updateOrderStatus(100L, OrderStatus.SHIPPED)).thenReturn(sampleOrder(OrderStatus.SHIPPED));

        mockMvc.perform(patch("/api/orders/100/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"orderStatus": "shipped"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderStatus").value("shipped"));
    }

    @Test
    void rejectsMissingOrderStatus() throws Exception {
        mockMvc.perform(patch("/api/orders/100/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.orderStatus").value("Order status is required"));
    }

    private OrderResponse sampleOrder(OrderStatus status) {
        return new OrderResponse(
                100L,
                1L,
                "jan.kowalski@example.com",
                10L,
                10L,
                status,
                new BigDecimal("399.98"),
                LocalDateTime.of(2026, 2, 1, 12, 0),
                List.of(new OrderItemResponse(500L, 3L, "GAR-001", "Garnek stalowy 5L", 2, new BigDecimal("199.99")))
        );
    }
}
