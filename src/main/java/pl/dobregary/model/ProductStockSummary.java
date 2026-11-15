package pl.dobregary.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Read-only JPA projection mapped to the {@code v_product_stock_summary} SQL view.
 */
@Entity
@Immutable
@Table(name = "v_product_stock_summary")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class ProductStockSummary {

    @Id
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "sku")
    private String sku;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "brand")
    private String brand;

    @Column(name = "base_price")
    private BigDecimal basePrice;

    @Column(name = "total_stock")
    private Integer totalStock;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ProductStockSummary other)) {
            return false;
        }
        return getProductId() != null && Objects.equals(getProductId(), other.getProductId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
