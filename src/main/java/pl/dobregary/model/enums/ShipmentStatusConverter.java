package pl.dobregary.model.enums;

import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ShipmentStatusConverter extends AbstractDatabaseEnumConverter<ShipmentStatus> {

    public ShipmentStatusConverter() {
        super(ShipmentStatus.class);
    }
}
