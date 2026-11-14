package pl.dobregary.model;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EntityValidationTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidatorFactory() {
        validatorFactory.close();
    }

    @Test
    void validatesUserConstraints() {
        User user = new User();
        user.setEmail("jan.kowalski@example.com");
        user.setPasswordHash("$2y$10$abcdefghijklmnopqrstuvwx01");
        user.setFirstName("Jan");
        user.setLastName("Kowalski");
        user.setPhone("+48 600 100 200");

        assertTrue(validator.validate(user).isEmpty());

        user.setEmail("invalid-email");
        user.setPasswordHash("short");
        Set<ConstraintViolation<User>> violations = validator.validate(user);
        assertFalse(violations.isEmpty());
    }

    @Test
    void validatesAddressPostalCodeAndOptionalLine2() {
        User user = new User();
        Address address = new Address();
        address.setUser(user);
        address.setRecipientName("Jan Kowalski");
        address.setStreetLine1("ul. Kwiatowa 15");
        address.setStreetLine2(null);
        address.setCity("Warszawa");
        address.setStateProvince("Mazowieckie");
        address.setPostalCode("00-001");

        assertTrue(validator.validate(address).isEmpty());

        address.setPostalCode("00001");
        address.setStreetLine2("   ");
        assertFalse(validator.validate(address).isEmpty());
    }

    @Test
    void validatesProductSkuAndPriceConstraints() {
        Product product = new Product();
        product.setSku("GAR-001");
        product.setName("Zestaw garnkow");
        product.setBrand("Gerlach");
        product.setDescription("Line 1\nLine 2");
        product.setBasePrice(new BigDecimal("399.99"));

        assertTrue(validator.validate(product).isEmpty());

        product.setSku("-INVALID");
        product.setBasePrice(BigDecimal.ZERO);
        assertFalse(validator.validate(product).isEmpty());
    }
}
