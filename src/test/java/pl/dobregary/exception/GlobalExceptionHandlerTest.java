package pl.dobregary.exception;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.UncategorizedSQLException;

import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void mapsNotFoundAndConflictExceptions() {
        ResponseEntity<ApiError> notFound = handler.handleNotFound(new ResourceNotFoundException("Product not found"));
        assertEquals(HttpStatus.NOT_FOUND, notFound.getStatusCode());
        assertNotNull(notFound.getBody());
        assertEquals("Product not found", notFound.getBody().message());

        ResponseEntity<ApiError> conflict = handler.handleConflict(new ConflictException("SKU already exists"));
        assertEquals(HttpStatus.CONFLICT, conflict.getStatusCode());
        assertNotNull(conflict.getBody());
        assertEquals("SKU already exists", conflict.getBody().message());
    }

    @Test
    void extractsTriggerAndIntegrityMessagesFromDatabaseExceptions() {
        SQLException triggerSqlEx = new SQLException("Niewystarczajaca ilosc produktu", "45000", 1644);
        UncategorizedSQLException triggerException = new UncategorizedSQLException("CallableStatement", "{call sp()}", triggerSqlEx);

        ResponseEntity<ApiError> triggerResponse = handler.handleDatabaseError(triggerException);
        assertEquals(HttpStatus.BAD_REQUEST, triggerResponse.getStatusCode());
        assertNotNull(triggerResponse.getBody());
        assertEquals("Niewystarczajaca ilosc produktu", triggerResponse.getBody().message());

        DataIntegrityViolationException integrityEx = new DataIntegrityViolationException(
                "Duplicate",
                new SQLException("Duplicate entry 'GAR-001' for key 'uq_products_sku'")
        );
        ResponseEntity<ApiError> integrityResponse = handler.handleDataIntegrity(integrityEx);
        assertEquals(HttpStatus.CONFLICT, integrityResponse.getStatusCode());
        assertNotNull(integrityResponse.getBody());
        assertEquals("Duplicate entry 'GAR-001' for key 'uq_products_sku'", integrityResponse.getBody().message());
    }

    @Test
    void stripsMariaDbConnectionPrefixFromDatabaseMessages() {
        SQLException triggerSqlEx = new SQLException("(conn=6) Błąd: Niewystarczająca ilość dostępnego produktu!", "45000", 1644);
        ResponseEntity<ApiError> triggerResponse = handler.handleDatabaseError(
                new UncategorizedSQLException("CallableStatement", "{call sp()}", triggerSqlEx));
        assertNotNull(triggerResponse.getBody());
        assertEquals("Błąd: Niewystarczająca ilość dostępnego produktu!", triggerResponse.getBody().message());

        DataIntegrityViolationException fkEx = new DataIntegrityViolationException(
                "FK",
                new SQLException("(conn=12) Cannot delete or update a parent row: a foreign key constraint fails")
        );
        ResponseEntity<ApiError> fkResponse = handler.handleDataIntegrity(fkEx);
        assertNotNull(fkResponse.getBody());
        assertEquals("Cannot delete or update a parent row: a foreign key constraint fails", fkResponse.getBody().message());
    }
}
