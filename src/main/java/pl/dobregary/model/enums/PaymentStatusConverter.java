package pl.dobregary.model.enums;

import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PaymentStatusConverter extends AbstractDatabaseEnumConverter<PaymentStatus> {

    public PaymentStatusConverter() {
        super(PaymentStatus.class);
    }
}
