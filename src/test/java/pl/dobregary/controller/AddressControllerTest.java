package pl.dobregary.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pl.dobregary.dto.AddressRequest;
import pl.dobregary.dto.AddressResponse;
import pl.dobregary.exception.ResourceNotFoundException;
import pl.dobregary.service.AddressService;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AddressController.class)
class AddressControllerTest {

    private static final String VALID_ADDRESS_JSON = """
            {
              "recipientName": "Jan Kowalski",
              "streetLine1": "ul. Kwiatowa 12/4",
              "city": "Krakow",
              "stateProvince": "malopolskie",
              "postalCode": "30-001"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AddressService addressService;

    @Test
    void listsAddressesOfUser() throws Exception {
        when(addressService.getAddressesForUser(1L)).thenReturn(List.of(sampleAddress(10L), sampleAddress(11L)));

        mockMvc.perform(get("/api/users/1/addresses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].userId").value(1));
    }

    @Test
    void createsAddressForUser() throws Exception {
        when(addressService.createAddress(eq(1L), any(AddressRequest.class))).thenReturn(sampleAddress(12L));

        mockMvc.perform(post("/api/users/1/addresses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_ADDRESS_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.addressId").value(12))
                .andExpect(jsonPath("$.postalCode").value("30-001"));
    }

    @Test
    void rejectsInvalidPostalCode() throws Exception {
        mockMvc.perform(post("/api/users/1/addresses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_ADDRESS_JSON.replace("30-001", "30001")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.postalCode").value("Postal code must follow XX-XXX format"));

        verify(addressService, never()).createAddress(any(), any());
    }

    @Test
    void returnsNotFoundForAddressOfAnotherUser() throws Exception {
        when(addressService.updateAddress(eq(2L), eq(10L), any(AddressRequest.class)))
                .thenThrow(new ResourceNotFoundException("Address 10 not found for user 2"));

        mockMvc.perform(put("/api/users/2/addresses/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_ADDRESS_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Address 10 not found for user 2"));
    }

    @Test
    void deletesAddressWithNoContent() throws Exception {
        mockMvc.perform(delete("/api/users/1/addresses/10"))
                .andExpect(status().isNoContent());

        verify(addressService).deleteAddress(1L, 10L);
    }

    private AddressResponse sampleAddress(Long id) {
        return new AddressResponse(
                id,
                1L,
                "Jan Kowalski",
                "ul. Kwiatowa 12/4",
                null,
                "Krakow",
                "malopolskie",
                "30-001",
                LocalDateTime.of(2026, 1, 10, 9, 5)
        );
    }
}
