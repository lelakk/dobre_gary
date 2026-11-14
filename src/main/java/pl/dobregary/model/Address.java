package pl.dobregary.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(
        name = "addresses",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_addresses_user_address",
                columnNames = {"user_id", "address_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@ToString
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "address_id")
    private Long addressId;

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @NotBlank(message = "Recipient name is required")
    @Size(max = 150)
    @Column(name = "recipient_name", nullable = false, length = 150)
    private String recipientName;

    @NotBlank(message = "Street line 1 is required")
    @Size(max = 255)
    @Column(name = "street_line1", nullable = false, length = 255)
    private String streetLine1;

    @Size(max = 255)
    @Pattern(regexp = ".*\\S.*", flags = Pattern.Flag.DOTALL, message = "Street line 2 cannot be blank")
    @Column(name = "street_line2", length = 255)
    private String streetLine2;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @NotBlank(message = "State or province is required")
    @Size(max = 100)
    @Column(name = "state_province", nullable = false, length = 100)
    private String stateProvince;

    @NotBlank(message = "Postal code is required")
    @Size(max = 20)
    @Pattern(regexp = "^[0-9]{2}-[0-9]{3}$", message = "Postal code must follow XX-XXX format")
    @Column(name = "postal_code", nullable = false, length = 20)
    private String postalCode;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Address other)) {
            return false;
        }
        return getAddressId() != null && Objects.equals(getAddressId(), other.getAddressId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
