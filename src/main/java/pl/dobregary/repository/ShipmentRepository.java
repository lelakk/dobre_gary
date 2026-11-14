package pl.dobregary.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.dobregary.model.Shipment;
import pl.dobregary.model.enums.ShipmentStatus;

import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    List<Shipment> findByOrderOrderId(Long orderId);

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    List<Shipment> findByShipmentStatus(ShipmentStatus shipmentStatus);
}
