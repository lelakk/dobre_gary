package pl.dobregary.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum OrderStatus implements DatabaseEnum {
    PENDING("pending"),
    PAID("paid"),
    PROCESSING("processing"),
    SHIPPED("shipped"),
    DELIVERED("delivered"),
    CANCELLED("cancelled");

    private final String databaseValue;

    OrderStatus(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    @JsonValue
    @Override
    public String getDatabaseValue() {
        return databaseValue;
    }

    @JsonCreator
    public static OrderStatus fromValue(String value) {
        return DatabaseEnum.fromDatabaseValue(OrderStatus.class, value);
    }
}
