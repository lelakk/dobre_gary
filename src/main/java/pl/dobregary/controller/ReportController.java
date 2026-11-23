package pl.dobregary.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.dobregary.service.ReportService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Analytical SQL queries from queries.sql")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/vip-customers")
    @Operation(summary = "Customers who spent more than 500 PLN on paid, non-cancelled orders")
    public List<Map<String, Object>> getVipCustomers() {
        return reportService.getVipCustomers();
    }

    @GetMapping("/sales-by-category")
    @Operation(summary = "Units sold and revenue per category")
    public List<Map<String, Object>> getSalesByCategory() {
        return reportService.getSalesByCategory();
    }

    @GetMapping("/premium-products")
    @Operation(summary = "Products priced above the store average")
    public List<Map<String, Object>> getPremiumProducts() {
        return reportService.getPremiumProducts();
    }

    @GetMapping("/stock-vs-sales")
    @Operation(summary = "Inventory value compared with sales per product")
    public List<Map<String, Object>> getStockVsSales() {
        return reportService.getStockVsSales();
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Products with low stock (< 15) or no sales at all")
    public List<Map<String, Object>> getLowStockOrUnsoldProducts() {
        return reportService.getLowStockOrUnsoldProducts();
    }

    @GetMapping("/monthly-revenue")
    @Operation(summary = "Monthly revenue, order count and average basket value")
    public List<Map<String, Object>> getMonthlyRevenue() {
        return reportService.getMonthlyRevenue();
    }

    @GetMapping("/multi-shipment-orders")
    @Operation(summary = "Orders delivered in more than one shipment")
    public List<Map<String, Object>> getMultiShipmentOrders() {
        return reportService.getMultiShipmentOrders();
    }

    @GetMapping("/payment-methods")
    @Operation(summary = "Success rate and collected revenue per payment method")
    public List<Map<String, Object>> getPaymentMethodStats() {
        return reportService.getPaymentMethodStats();
    }

    @GetMapping("/category-tree")
    @Operation(summary = "Category hierarchy with product counts and average prices")
    public List<Map<String, Object>> getCategoryTree() {
        return reportService.getCategoryTree();
    }
}
