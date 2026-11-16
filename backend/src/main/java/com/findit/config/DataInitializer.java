package com.findit.config;

import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates the default admin and three demo students if they do not exist yet.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean enabled;

    @Value("${app.seed.admin-password}")
    private String adminPassword;

    @Value("${app.seed.student-password}")
    private String studentPassword;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!enabled)
            return;

        createIfMissing("System Admin", "admin@findit.edu", "ADMIN001", "Administration", adminPassword, Role.ADMIN);
        createIfMissing("Aarav Sharma", "aarav.sharma@college.edu", "CS2021001", "Computer Science", studentPassword,
                Role.STUDENT);
        createIfMissing("Priya Nair", "priya.nair@college.edu", "EC2021002", "Electronics", studentPassword,
                Role.STUDENT);
        createIfMissing("Rohan Mehta", "rohan.mehta@college.edu", "ME2021003", "Mechanical", studentPassword,
                Role.STUDENT);
    }

    private void createIfMissing(String fullName, String email, String studentId,
            String department, String rawPassword, Role role) {
        if (userRepository.existsByEmail(email) || userRepository.existsByStudentId(studentId)) {
            return;
        }
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setStudentId(studentId);
        user.setDepartment(department);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        userRepository.save(user);
        log.info("Created demo account {} ({})", email, role);
    }
}

