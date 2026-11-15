package pl.dobregary.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcOperations;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private JdbcOperations jdbcOperations;

    @InjectMocks
    private ReportService reportService;

    @Test
    void delegatesAnalyticalQueriesToJdbcOperations() {
        List<Map<String, Object>> expected = List.of(Map.of("customer_name", "Jan Kowalski"));
        when(jdbcOperations.queryForList(anyString())).thenReturn(expected);

        List<Map<String, Object>> result = reportService.getVipCustomers();

        assertEquals(expected, result);
        verify(jdbcOperations).queryForList(anyString());
    }
}
