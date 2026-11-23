package pl.dobregary.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pl.dobregary.dto.AddressRequest;
import pl.dobregary.dto.AddressResponse;
import pl.dobregary.service.AddressService;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/addresses")
@RequiredArgsConstructor
@Tag(name = "Addresses", description = "CRUD for addresses owned by a user")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @Operation(summary = "List addresses of a user")
    public List<AddressResponse> getAddresses(@PathVariable Long userId) {
        return addressService.getAddressesForUser(userId);
    }

    @GetMapping("/{addressId}")
    @Operation(summary = "Get a single address of a user")
    public AddressResponse getAddress(@PathVariable Long userId, @PathVariable Long addressId) {
        return addressService.getAddressById(userId, addressId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add an address to a user")
    public AddressResponse createAddress(@PathVariable Long userId, @Valid @RequestBody AddressRequest request) {
        return addressService.createAddress(userId, request);
    }

    @PutMapping("/{addressId}")
    @Operation(summary = "Update an address of a user")
    public AddressResponse updateAddress(@PathVariable Long userId,
                                         @PathVariable Long addressId,
                                         @Valid @RequestBody AddressRequest request) {
        return addressService.updateAddress(userId, addressId, request);
    }

    @DeleteMapping("/{addressId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an address of a user")
    public void deleteAddress(@PathVariable Long userId, @PathVariable Long addressId) {
        addressService.deleteAddress(userId, addressId);
    }
}
