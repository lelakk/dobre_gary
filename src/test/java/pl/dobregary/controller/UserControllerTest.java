package pl.dobregary.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pl.dobregary.dto.CreateUserRequest;
import pl.dobregary.dto.UpdateUserRequest;
import pl.dobregary.dto.UserResponse;
import pl.dobregary.exception.ConflictException;
import pl.dobregary.exception.ResourceNotFoundException;
import pl.dobregary.service.UserService;

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

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @Test
    void listsAllUsers() throws Exception {
        when(userService.getAllUsers()).thenReturn(List.of(sampleUser(1L), sampleUser(2L)));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].email").value("jan.kowalski@example.com"));
    }

    @Test
    void createsUserWithoutExposingPassword() throws Exception {
        when(userService.createUser(any(CreateUserRequest.class))).thenReturn(sampleUser(5L));

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "jan.kowalski@example.com",
                                  "password": "tajneHaslo123",
                                  "firstName": "Jan",
                                  "lastName": "Kowalski",
                                  "phone": "+48 600 100 200"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(5))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void rejectsInvalidEmailAndShortPassword() throws Exception {
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "not-an-email", "password": "123", "firstName": "Jan", "lastName": "Kowalski"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").value("Invalid email format"))
                .andExpect(jsonPath("$.fieldErrors.password").value("Password must be between 8 and 100 characters"));

        verify(userService, never()).createUser(any());
    }

    @Test
    void acceptsEmptyPhoneFromFormAndRejectsLetters() throws Exception {
        when(userService.updateUser(eq(1L), any(UpdateUserRequest.class))).thenReturn(sampleUser(1L));

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "jan.kowalski@example.com", "firstName": "Jan", "lastName": "Kowalski", "phone": ""}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "jan.kowalski@example.com", "firstName": "Jan", "lastName": "Kowalski", "phone": "abc"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.phone").value("Invalid phone number format"));
    }

    @Test
    void mapsDuplicateEmailToConflict() throws Exception {
        when(userService.updateUser(eq(1L), any(UpdateUserRequest.class)))
                .thenThrow(new ConflictException("User with email already exists: anna@example.com"));

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "anna@example.com", "firstName": "Jan", "lastName": "Kowalski"}
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    void returnsNotFoundForMissingUser() throws Exception {
        when(userService.getUserById(42L)).thenThrow(new ResourceNotFoundException("User not found with id: 42"));

        mockMvc.perform(get("/api/users/42"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found with id: 42"));
    }

    @Test
    void deletesUserWithNoContent() throws Exception {
        mockMvc.perform(delete("/api/users/3"))
                .andExpect(status().isNoContent());

        verify(userService).deleteUser(3L);
    }

    private UserResponse sampleUser(Long id) {
        return new UserResponse(
                id,
                "jan.kowalski@example.com",
                "Jan",
                "Kowalski",
                "+48 600 100 200",
                LocalDateTime.of(2026, 1, 10, 9, 0)
        );
    }
}
