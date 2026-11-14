package pl.dobregary.model.enums;

import jakarta.persistence.AttributeConverter;

/**
 * Reusable JPA AttributeConverter mapping {@link DatabaseEnum} constants to database strings.
 */
public abstract class AbstractDatabaseEnumConverter<E extends Enum<E> & DatabaseEnum>
        implements AttributeConverter<E, String> {

    private final Class<E> enumType;

    protected AbstractDatabaseEnumConverter(Class<E> enumType) {
        this.enumType = enumType;
    }

    @Override
    public String convertToDatabaseColumn(E attribute) {
        return attribute == null ? null : attribute.getDatabaseValue();
    }

    @Override
    public E convertToEntityAttribute(String dbData) {
        return DatabaseEnum.fromDatabaseValue(enumType, dbData);
    }
}
