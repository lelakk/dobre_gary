package pl.dobregary.model.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DatabaseEnumConverterTest {

    @Test
    void convertsEnumsToLowercaseDatabaseValuesAndBack() {
        OrderStatusConverter orderConverter = new OrderStatusConverter();
        assertEquals("pending", orderConverter.convertToDatabaseColumn(OrderStatus.PENDING));
        assertEquals(OrderStatus.PROCESSING, orderConverter.convertToEntityAttribute("processing"));
        assertEquals(OrderStatus.DELIVERED, orderConverter.convertToEntityAttribute("DELIVERED"));
        assertNull(orderConverter.convertToDatabaseColumn(null));
        assertNull(orderConverter.convertToEntityAttribute(null));

        PaymentMethodConverter methodConverter = new PaymentMethodConverter();
        assertEquals("credit_card", methodConverter.convertToDatabaseColumn(PaymentMethod.CREDIT_CARD));
        assertEquals(PaymentMethod.BLIK, methodConverter.convertToEntityAttribute("blik"));

        PaymentStatusConverter paymentStatusConverter = new PaymentStatusConverter();
        assertEquals("initiated", paymentStatusConverter.convertToDatabaseColumn(PaymentStatus.INITIATED));
        assertEquals(PaymentStatus.REFUNDED, paymentStatusConverter.convertToEntityAttribute("refunded"));

        ShipmentStatusConverter shipmentConverter = new ShipmentStatusConverter();
        assertEquals("out_for_delivery", shipmentConverter.convertToDatabaseColumn(ShipmentStatus.OUT_FOR_DELIVERY));
        assertEquals(ShipmentStatus.LABEL_CREATED, shipmentConverter.convertToEntityAttribute("label_created"));
    }

    @Test
    void throwsOnUnknownDatabaseValue() {
        OrderStatusConverter converter = new OrderStatusConverter();
        assertThrows(IllegalArgumentException.class, () -> converter.convertToEntityAttribute("unknown_status"));
    }
}
