package pl.dobregary.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.dobregary.dto.AddressRequest;
import pl.dobregary.dto.AddressResponse;
import pl.dobregary.exception.ResourceNotFoundException;
import pl.dobregary.model.Address;
import pl.dobregary.model.User;
import pl.dobregary.repository.AddressRepository;
import pl.dobregary.repository.UserRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AddressServiceTest {

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AddressService addressService;

    @Test
    void createsAddressForExistingUser() {
        User user = new User();
        user.setUserId(4L);

        when(userRepository.findById(4L)).thenReturn(Optional.of(user));
        when(addressRepository.save(any(Address.class))).thenAnswer(invocation -> {
            Address saved = invocation.getArgument(0);
            saved.setAddressId(12L);
            return saved;
        });

        AddressResponse response = addressService.createAddress(4L, new AddressRequest(
                "Maria Wojcik",
                "ul. Sloneczna 12",
                null,
                "Wroclaw",
                "Dolnoslaskie",
                "50-004"
        ));

        assertEquals(12L, response.addressId());
        assertEquals(4L, response.userId());
        assertEquals("50-004", response.postalCode());
    }

    @Test
    void throwsWhenUpdatingAddressNotOwnedByUser() {
        when(addressRepository.findByAddressIdAndUserUserId(99L, 4L)).thenReturn(Optional.empty());

        AddressRequest request = new AddressRequest(
                "Maria Wojcik",
                "ul. Sloneczna 12",
                null,
                "Wroclaw",
                "Dolnoslaskie",
                "50-004"
        );

        assertThrows(ResourceNotFoundException.class, () -> addressService.updateAddress(4L, 99L, request));
    }
}
