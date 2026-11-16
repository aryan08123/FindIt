package com.findit.service;

import com.findit.dto.response.DashboardResponse;
import com.findit.dto.response.UserResponse;
import com.findit.entity.ClaimStatus;
import com.findit.entity.Item;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.exception.BadRequestException;
import com.findit.exception.ResourceNotFoundException;
import com.findit.repository.ClaimRepository;
import com.findit.repository.ItemRepository;
import com.findit.repository.UserRepository;
import com.findit.security.UserPrincipal;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

/** Admin-only operations: dashboard statistics and user management. */
@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ClaimRepository claimRepository;
    private final FileStorageService fileStorageService;

    public AdminService(UserRepository userRepository,
            ItemRepository itemRepository,
            ClaimRepository claimRepository,
            FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.claimRepository = claimRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard() {
        return new DashboardResponse(
                userRepository.countByRole(Role.STUDENT),
                itemRepository.countByItemType(ItemType.LOST),
                itemRepository.countByItemType(ItemType.FOUND),
                itemRepository.countByStatus(ItemStatus.ACTIVE),
                itemRepository.countByStatus(ItemStatus.CLAIMED),
                itemRepository.countByStatus(ItemStatus.RECOVERED),
                claimRepository.count(),
                claimRepository.countByStatus(ClaimStatus.PENDING),
                claimRepository.countByStatus(ClaimStatus.APPROVED),
                claimRepository.countByStatus(ClaimStatus.REJECTED));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> users() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream().map(UserResponse::from).toList();
    }

    /**
     * Deletes a student with all their reports and claims (and the image files of
     * those reports).
     */
    @Transactional
    public void deleteUser(Long id, UserPrincipal admin) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        if (user.getId().equals(admin.getId())) {
            throw new BadRequestException("You cannot delete your own account");
        }
        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Administrator accounts cannot be deleted");
        }

        List<String> images = itemRepository.findByReporterIdOrderByCreatedAtDesc(id).stream()
                .map(Item::getImageUrl)
                .filter(Objects::nonNull)
                .toList();

        userRepository.delete(user); // reports and claims are removed with the user
        userRepository.flush();
        images.forEach(fileStorageService::delete);
    }
}

