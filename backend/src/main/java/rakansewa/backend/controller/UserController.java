package rakansewa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rakansewa.backend.model.User;
import rakansewa.backend.service.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // POST /users — Create a new user
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User savedUser = userService.createUser(user);
            return ResponseEntity.ok(savedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // GET /users — Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        for (User user : users) {
            if (user.getAllowContact() == null || !user.getAllowContact()) {
                user.setPhoneNumber(null);
            }
        }
        return ResponseEntity.ok(users);
    }

    // PUT /users/{id} - Update a user
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User updatedUser = userService.updateUser(id, user);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // PUT /users/{id}/link-property — Link/unlink a user to a property
    @PutMapping("/{id}/link-property")
    public ResponseEntity<?> linkProperty(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            Long propertyId = null;
            if (body.containsKey("propertyId") && body.get("propertyId") != null) {
                propertyId = Long.valueOf(body.get("propertyId").toString());
            }
            User updated = userService.linkProperty(id, propertyId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
