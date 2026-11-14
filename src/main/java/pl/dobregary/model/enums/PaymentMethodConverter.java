package pl.dobregary.model.enums;

import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PaymentMethodConverter extends AbstractDatabaseEnumConverter<PaymentMethod> {

    public PaymentMethodConverter() {
        super(PaymentMethod.class);
    }
}
