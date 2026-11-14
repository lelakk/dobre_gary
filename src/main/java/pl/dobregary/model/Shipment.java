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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import pl.dobregary.model.enums.ShipmentStatus;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@ToString
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shipment_id")
    private Long shipmentId;

    @NotNull(message = "Order is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    @ToString.Exclude
    private Order order;

    @NotBlank(message = "Carrier is required")
    @Size(max = 100)
    @Column(name = "carrier", nullable = false, length = 100)
    private String carrier;

    @Size(max = 150)
    @Pattern(regexp = ".*\\S.*", flags = Pattern.Flag.DOTALL, message = "Tracking number cannot be blank if provided")
    @Column(name = "tracking_number", unique = true, length = 150)
    private String trackingNumber;

    @NotNull(message = "Shipment status is required")
    @Column(name = "shipment_status", nullable = false)
    private ShipmentStatus shipmentStatus = ShipmentStatus.LABEL_CREATED;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Shipment other)) {
            return false;
        }
        return getShipmentId() != null && Objects.equals(getShipmentId(), other.getShipmentId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
