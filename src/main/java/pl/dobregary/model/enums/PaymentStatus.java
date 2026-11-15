package pl.dobregary.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PaymentStatus implements DatabaseEnum {
    INITIATED("initiated"),
    COMPLETED("completed"),
    FAILED("failed"),
    REFUNDED("refunded");

    private final String databaseValue;

    PaymentStatus(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    @JsonValue
    @Override
    public String getDatabaseValue() {
        return databaseValue;
    }

    @JsonCreator
    public static PaymentStatus fromValue(String value) {
        return DatabaseEnum.fromDatabaseValue(PaymentStatus.class, value);
    }
}
