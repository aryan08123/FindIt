package com.findit.service;

import com.findit.dto.request.LoginRequest;
import com.findit.dto.request.RegisterRequest;
import com.findit.dto.response.AuthResponse;
import com.findit.dto.response.UserResponse;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.exception.BadRequestException;
import com.findit.exception.DuplicateResourceException;
import com.findit.repository.UserRepository;
import com.findit.security.JwtUtil;
import com.findit.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Registration, login and "who am I" logic. */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public UserResponse register(RegisterRequest req) {
        if (!req.password().equals(req.confirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }
        String email = req.email().trim().toLowerCase();
        String studentId = req.studentId().trim();

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("This email is already registered");
        }
        if (userRepository.existsByStudentId(studentId)) {
            throw new DuplicateResourceException("This student ID is already registered");
        }

        User user = new User();
        user.setFullName(req.fullName().trim());
        user.setEmail(email);
        user.setStudentId(studentId);
        user.setDepartment(req.department().trim());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setRole(Role.STUDENT); // always STUDENT; admins are never created through the API

        return UserResponse.from(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest req) {
        // Throws BadCredentialsException (-> HTTP 401) for a wrong email or password
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email().trim().toLowerCase(), req.password()));

        User user = ((UserPrincipal) auth.getPrincipal()).getUser();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, "Bearer", UserResponse.from(user));
    }

    public UserResponse currentUser(UserPrincipal principal) {
        return UserResponse.from(principal.getUser());
    }
}

