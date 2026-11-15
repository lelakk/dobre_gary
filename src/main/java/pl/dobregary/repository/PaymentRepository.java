package pl.dobregary.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.dobregary.model.Payment;
import pl.dobregary.model.enums.PaymentStatus;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByOrderOrderId(Long orderId);

    Optional<Payment> findByTransactionReference(String transactionReference);

    List<Payment> findByPaymentStatus(PaymentStatus paymentStatus);
}
