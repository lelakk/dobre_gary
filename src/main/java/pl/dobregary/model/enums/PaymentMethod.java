package pl.dobregary.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PaymentMethod implements DatabaseEnum {
    CREDIT_CARD("credit_card"),
    PAYPAL("paypal"),
    BANK_TRANSFER("bank_transfer"),
    STRIPE("stripe"),
    BLIK("blik");

    private final String databaseValue;

    PaymentMethod(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    @JsonValue
    @Override
    public String getDatabaseValue() {
        return databaseValue;
    }

    @JsonCreator
    public static PaymentMethod fromValue(String value) {
        return DatabaseEnum.fromDatabaseValue(PaymentMethod.class, value);
    }
}
