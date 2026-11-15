package pl.dobregary.model.enums;

/**
 * Contract for Java enums persisted as lowercase string values in MariaDB ENUM columns.
 */
public interface DatabaseEnum {

    String getDatabaseValue();

    static <E extends Enum<E> & DatabaseEnum> E fromDatabaseValue(Class<E> enumType, String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        for (E constant : enumType.getEnumConstants()) {
            if (constant.getDatabaseValue().equalsIgnoreCase(normalized)) {
                return constant;
            }
        }
        throw new IllegalArgumentException(
                "Invalid " + enumType.getSimpleName() + " value: '" + value + "'"
        );
    }
}
