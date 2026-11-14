package pl.dobregary.model.enums;

import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class OrderStatusConverter extends AbstractDatabaseEnumConverter<OrderStatus> {

    public OrderStatusConverter() {
        super(OrderStatus.class);
    }
}
