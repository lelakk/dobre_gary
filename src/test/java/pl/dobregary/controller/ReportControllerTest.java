package pl.dobregary.controller;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pl.dobregary.service.ReportService;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Stream;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReportController.class)
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReportService reportService;

    static Stream<Arguments> reportEndpoints() {
        return Stream.of(
                Arguments.of("vip-customers", (Function<ReportService, List<Map<String, Object>>>) ReportService::getVipCustomers),
                Arguments.of("sales-by-category", (Function<ReportService, List<Map<String, Object>>>) ReportService::getSalesByCategory),
                Arguments.of("premium-products", (Function<ReportService, List<Map<String, Object>>>) ReportService::getPremiumProducts),
                Arguments.of("stock-vs-sales", (Function<ReportService, List<Map<String, Object>>>) ReportService::getStockVsSales),
                Arguments.of("low-stock", (Function<ReportService, List<Map<String, Object>>>) ReportService::getLowStockOrUnsoldProducts),
                Arguments.of("monthly-revenue", (Function<ReportService, List<Map<String, Object>>>) ReportService::getMonthlyRevenue),
                Arguments.of("multi-shipment-orders", (Function<ReportService, List<Map<String, Object>>>) ReportService::getMultiShipmentOrders),
                Arguments.of("payment-methods", (Function<ReportService, List<Map<String, Object>>>) ReportService::getPaymentMethodStats),
                Arguments.of("category-tree", (Function<ReportService, List<Map<String, Object>>>) ReportService::getCategoryTree)
        );
    }

    @ParameterizedTest(name = "GET /api/reports/{0}")
    @MethodSource("reportEndpoints")
    void exposesReportRowsAsJson(String path, Function<ReportService, List<Map<String, Object>>> reportCall) throws Exception {
        when(reportCall.apply(reportService)).thenReturn(List.of(Map.of("report", path, "value", 42)));

        mockMvc.perform(get("/api/reports/" + path))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].report").value(path))
                .andExpect(jsonPath("$[0].value").value(42));
    }
}
