package com.findit.service;

import com.findit.dto.request.ClaimRequest;
import com.findit.dto.response.ClaimResponse;
import com.findit.entity.Claim;
import com.findit.entity.ClaimStatus;
import com.findit.entity.Item;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.exception.BadRequestException;
import com.findit.exception.DuplicateResourceException;
import com.findit.exception.ResourceNotFoundException;
import com.findit.repository.ClaimRepository;
import com.findit.repository.ItemRepository;
import com.findit.repository.UserRepository;
import com.findit.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** The claim workflow: submit, view, approve, reject. */
@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public ClaimService(ClaimRepository claimRepository,
            ItemRepository itemRepository,
            UserRepository userRepository) {
        this.claimRepository = claimRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
    }

    // ===================== SUBMIT =====================

    @Transactional
    public ClaimResponse submit(Long itemId, ClaimRequest req, UserPrincipal principal) {
        if (principal.getUser().getRole() == Role.ADMIN) {
            throw new AccessDeniedException("Administrators cannot submit claims");
        }
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id " + itemId));

        if (item.getItemType() != ItemType.FOUND) {
            throw new BadRequestException("Claims can only be submitted for found items");
        }
        if (item.getStatus() != ItemStatus.ACTIVE) {
            throw new BadRequestException("This item is no longer available for claims");
        }
        if (item.getReporter().getId().equals(principal.getId())) {
            throw new BadRequestException("You cannot claim an item that you reported yourself");
        }
        if (claimRepository.existsByItemIdAndClaimantId(itemId, principal.getId())) {
            throw new DuplicateResourceException("You have already submitted a claim for this item");
        }

        User claimant = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Claim claim = new Claim();
        claim.setItem(item);
        claim.setClaimant(claimant);
        claim.setDescription(req.description().trim());
        claim.setProofDetails(req.proofDetails().trim());
        claim.setStatus(ClaimStatus.PENDING);

        return toResponse(claimRepository.save(claim), false);
    }

    // ===================== READ =====================

    @Transactional(readOnly = true)
    public List<ClaimResponse> myClaims(UserPrincipal principal) {
        return claimRepository.findByClaimantIdOrderByCreatedAtDesc(principal.getId())
                .stream().map(c -> toResponse(c, false)).toList();
    }

    /** Admin: all claims, optionally filtered by status. */
    @Transactional(readOnly = true)
    public List<ClaimResponse> all(ClaimStatus status) {
        List<Claim> claims = (status == null)
                ? claimRepository.findAllByOrderByCreatedAtDesc()
                : claimRepository.findByStatusOrderByCreatedAtDesc(status);
        return claims.stream().map(c -> toResponse(c, true)).toList();
    }

    @Transactional(readOnly = true)
    public ClaimResponse getById(Long id, UserPrincipal principal) {
        Claim claim = find(id);
        boolean admin = principal.getUser().getRole() == Role.ADMIN;
        if (!admin && !claim.getClaimant().getId().equals(principal.getId())) {
            throw new AccessDeniedException("You can only view your own claims");
        }
        return toResponse(claim, admin);
    }

    // ===================== REVIEW (admin) =====================

    @Transactional
    public ClaimResponse approve(Long id, String remarks) {
        Claim claim = find(id);
        requirePending(claim);

        Item item = claim.getItem();
        if (item.getStatus() != ItemStatus.ACTIVE) {
            throw new BadRequestException("The item is no longer available (status: " + item.getStatus() + ")");
        }

        claim.setStatus(ClaimStatus.APPROVED);
        claim.setAdminRemarks(clean(remarks));
        item.setStatus(ItemStatus.CLAIMED);

        // Competing pending claims for the same item can no longer be granted
        for (Claim other : claimRepository.findByItemIdAndStatus(item.getId(), ClaimStatus.PENDING)) {
            if (!other.getId().equals(claim.getId())) {
                other.setStatus(ClaimStatus.REJECTED);
                other.setAdminRemarks("Another claim for this item was approved");
            }
        }
        return toResponse(claim, true);
    }

    @Transactional
    public ClaimResponse reject(Long id, String remarks) {
        Claim claim = find(id);
        requirePending(claim);

        String reason = clean(remarks);
        if (reason == null) {
            throw new BadRequestException("Please give a reason when rejecting a claim");
        }
        claim.setStatus(ClaimStatus.REJECTED);
        claim.setAdminRemarks(reason);
        return toResponse(claim, true);
    }

    // ===================== HELPERS =====================

    private Claim find(Long id) {
        return claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id " + id));
    }

    private void requirePending(Claim claim) {
        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new BadRequestException("This claim has already been " + claim.getStatus().name().toLowerCase());
        }
    }

    private String clean(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private ClaimResponse toResponse(Claim c, boolean forAdmin) {
        Item i = c.getItem();
        User u = c.getClaimant();
        return new ClaimResponse(
                c.getId(), i.getId(), i.getItemName(), i.getItemType().name(), i.getImageUrl(),
                i.getStatus().name(), i.getLocation(), i.getReporter().getFullName(),
                forAdmin ? i.getAdditionalDetails() : null,
                u.getId(), u.getFullName(), u.getEmail(), u.getStudentId(), u.getDepartment(),
                c.getDescription(), c.getProofDetails(), c.getStatus().name(),
                c.getAdminRemarks(), c.getCreatedAt());
    }
}

