package pl.dobregary.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ShipmentStatus implements DatabaseEnum {
    LABEL_CREATED("label_created"),
    IN_TRANSIT("in_transit"),
    OUT_FOR_DELIVERY("out_for_delivery"),
    DELIVERED("delivered");

    private final String databaseValue;

    ShipmentStatus(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    @JsonValue
    @Override
    public String getDatabaseValue() {
        return databaseValue;
    }

    @JsonCreator
    public static ShipmentStatus fromValue(String value) {
        return DatabaseEnum.fromDatabaseValue(ShipmentStatus.class, value);
    }
}
