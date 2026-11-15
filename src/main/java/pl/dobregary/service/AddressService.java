package pl.dobregary.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.dobregary.dto.AddressRequest;
import pl.dobregary.dto.AddressResponse;
import pl.dobregary.exception.ResourceNotFoundException;
import pl.dobregary.model.Address;
import pl.dobregary.model.User;
import pl.dobregary.repository.AddressRepository;
import pl.dobregary.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<AddressResponse> getAddressesForUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return addressRepository.findByUserUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public AddressResponse getAddressById(Long userId, Long addressId) {
        return toResponse(findOwnedAddress(userId, addressId));
    }

    @Transactional
    public AddressResponse createAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Address address = new Address();
        address.setUser(user);
        applyRequestFields(address, request);
        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        Address address = findOwnedAddress(userId, addressId);
        applyRequestFields(address, request);
        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = findOwnedAddress(userId, addressId);
        addressRepository.delete(address);
    }

    private Address findOwnedAddress(Long userId, Long addressId) {
        return addressRepository.findByAddressIdAndUserUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address " + addressId + " not found for user " + userId
                ));
    }

    private void applyRequestFields(Address address, AddressRequest request) {
        address.setRecipientName(request.recipientName().trim());
        address.setStreetLine1(request.streetLine1().trim());
        address.setStreetLine2(request.streetLine2() != null ? request.streetLine2().trim() : null);
        address.setCity(request.city().trim());
        address.setStateProvince(request.stateProvince().trim());
        address.setPostalCode(request.postalCode().trim());
    }

    private AddressResponse toResponse(Address address) {
        return new AddressResponse(
                address.getAddressId(),
                address.getUser().getUserId(),
                address.getRecipientName(),
                address.getStreetLine1(),
                address.getStreetLine2(),
                address.getCity(),
                address.getStateProvince(),
                address.getPostalCode(),
                address.getCreatedAt()
        );
    }
}
