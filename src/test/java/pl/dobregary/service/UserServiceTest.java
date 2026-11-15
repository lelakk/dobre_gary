package pl.dobregary.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.dobregary.dto.CreateUserRequest;
import pl.dobregary.dto.UserResponse;
import pl.dobregary.exception.ConflictException;
import pl.dobregary.model.User;
import pl.dobregary.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void createsUserWithHashedPasswordSatisfyingDatabaseConstraint() {
        when(userRepository.existsByEmail("jan@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            assertTrue(saved.getPasswordHash().length() >= 20);
            saved.setUserId(1L);
            return saved;
        });

        UserResponse response = userService.createUser(new CreateUserRequest(
                "  jan@example.com  ",
                "secret123",
                "Jan",
                "Kowalski",
                "+48 600 100 200"
        ));

        assertEquals(1L, response.userId());
        assertEquals("jan@example.com", response.email());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void throwsConflictWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail("jan@example.com")).thenReturn(true);

        CreateUserRequest request = new CreateUserRequest(
                "jan@example.com",
                "secret123",
                "Jan",
                "Kowalski",
                null
        );

        assertThrows(ConflictException.class, () -> userService.createUser(request));
    }
}
