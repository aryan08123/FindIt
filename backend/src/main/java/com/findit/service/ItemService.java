package com.findit.service;

import com.findit.dto.request.ItemRequest;
import com.findit.dto.response.ItemResponse;
import com.findit.dto.response.PublicStatsResponse;
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
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

/**
 * Business logic for lost/found reports: create, browse, edit, delete, status
 * changes.
 */
@Service
public class ItemService {

    public static final List<String> CATEGORIES = List.of(
            "Electronics", "Bags", "Books & Stationery", "Documents", "Clothing",
            "Accessories", "Keys", "Personal Items", "Sports Equipment", "Others");

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ClaimRepository claimRepository;
    private final FileStorageService fileStorageService;

    public ItemService(ItemRepository itemRepository,
            UserRepository userRepository,
            ClaimRepository claimRepository,
            FileStorageService fileStorageService) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.claimRepository = claimRepository;
        this.fileStorageService = fileStorageService;
    }

    // ===================== CREATE =====================

    @Transactional
    public ItemResponse create(ItemRequest req, MultipartFile image, ItemType type, UserPrincipal principal) {
        validateCategory(req.category());
        if (type == ItemType.LOST && clean(req.contactInfo()) == null) {
            throw new BadRequestException("Contact information is required for lost items");
        }

        String imageUrl = fileStorageService.store(image);

        Item item = new Item();
        apply(item, req);
        item.setItemType(type);
        item.setStatus(ItemStatus.ACTIVE);
        item.setImageUrl(imageUrl);
        item.setReporter(userRepository.getReferenceById(principal.getId()));

        try {
            item = itemRepository.save(item);
        } catch (RuntimeException e) {
            fileStorageService.delete(imageUrl); // do not leave an orphan image behind
            throw e;
        }
        return detail(item, principal.getUser());
    }

    // ===================== READ =====================

    /**
     * Browse/search. Every filter is optional. Safe for guests (viewer may be
     * null).
     */
    @Transactional(readOnly = true)
    public List<ItemResponse> search(ItemType type, ItemStatus status, String category,
            String keyword, String location, UserPrincipal viewer) {
        String cat = clean(category);
        String kw = clean(keyword);
        String loc = clean(location);

        Specification<Item> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (type != null)
                predicates.add(cb.equal(root.get("itemType"), type));
            if (status != null)
                predicates.add(cb.equal(root.get("status"), status));
            if (cat != null)
                predicates.add(cb.equal(root.get("category"), cat));
            if (kw != null)
                predicates.add(cb.like(cb.lower(root.get("itemName")), "%" + kw.toLowerCase() + "%"));
            if (loc != null)
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + loc.toLowerCase() + "%"));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        User v = viewer == null ? null : viewer.getUser();
        return itemRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream().map(i -> summary(i, v)).toList();
    }

    @Transactional(readOnly = true)
    public ItemResponse getById(Long id, UserPrincipal viewer) {
        return detail(find(id), viewer == null ? null : viewer.getUser());
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> myReports(UserPrincipal principal) {
        User me = principal.getUser();
        return itemRepository.findByReporterIdOrderByCreatedAtDesc(principal.getId())
                .stream().map(i -> detail(i, me)).toList();
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> recentItems() {
        return itemRepository.findTop8ByOrderByCreatedAtDesc()
                .stream().map(i -> summary(i, null)).toList();
    }

    /**
     * Admin view: every report with all private details (contact, identifying
     * details).
     */
    @Transactional(readOnly = true)
    public List<ItemResponse> allReports(UserPrincipal admin) {
        User viewer = admin.getUser();
        return itemRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(i -> detail(i, viewer)).toList();
    }

    @Transactional(readOnly = true)
    public PublicStatsResponse publicStats() {
        return new PublicStatsResponse(
                itemRepository.countByItemType(ItemType.LOST),
                itemRepository.countByItemType(ItemType.FOUND),
                itemRepository.countByStatus(ItemStatus.RECOVERED),
                userRepository.countByRole(Role.STUDENT));
    }

    // ===================== UPDATE =====================

    @Transactional
    public ItemResponse update(Long id, ItemRequest req, MultipartFile image,
            boolean removeImage, UserPrincipal principal) {
        Item item = find(id);
        if (!isOwner(item, principal)) {
            throw new AccessDeniedException("You can only edit your own reports");
        }
        if (item.getStatus() != ItemStatus.ACTIVE) {
            throw new BadRequestException("Only active reports can be edited");
        }
        validateCategory(req.category());
        if (item.getItemType() == ItemType.LOST && clean(req.contactInfo()) == null) {
            throw new BadRequestException("Contact information is required for lost items");
        }

        String oldImage = item.getImageUrl();
        String newImage = fileStorageService.store(image); // null when no new file was sent
        if (newImage != null) {
            item.setImageUrl(newImage);
        } else if (removeImage) {
            item.setImageUrl(null);
        }
        apply(item, req);
        Item saved = itemRepository.save(item);

        if (oldImage != null && !oldImage.equals(saved.getImageUrl())) {
            fileStorageService.delete(oldImage);
        }
        return detail(saved, principal.getUser());
    }

    @Transactional
    public ItemResponse updateStatus(Long id, ItemStatus newStatus, UserPrincipal principal) {
        Item item = find(id);
        boolean admin = isAdmin(principal);

        if (!admin) {
            if (!isOwner(item, principal)) {
                throw new AccessDeniedException("You can only change the status of your own reports");
            }
            boolean allowed = newStatus == ItemStatus.RECOVERED
                    && (item.getItemType() == ItemType.LOST || item.getStatus() == ItemStatus.CLAIMED);
            if (!allowed) {
                throw new AccessDeniedException(
                        "You can only mark your own lost item, or a claimed found item, as recovered");
            }
        }
        item.setStatus(newStatus);
        return detail(itemRepository.save(item), principal.getUser());
    }

    // ===================== DELETE =====================

    @Transactional
    public void delete(Long id, UserPrincipal principal) {
        Item item = find(id);
        if (!isOwner(item, principal) && !isAdmin(principal)) {
            throw new AccessDeniedException("You can only delete your own reports");
        }
        String imageUrl = item.getImageUrl();
        itemRepository.delete(item); // related claims are removed with it
        itemRepository.flush();
        fileStorageService.delete(imageUrl);
    }

    // ===================== HELPERS =====================

    private Item find(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id " + id));
    }

    private boolean isOwner(Item item, UserPrincipal p) {
        return p != null && item.getReporter().getId().equals(p.getId());
    }

    private boolean isAdmin(UserPrincipal p) {
        return p != null && p.getUser().getRole() == Role.ADMIN;
    }

    private void validateCategory(String category) {
        if (!CATEGORIES.contains(category.trim())) {
            throw new BadRequestException("Invalid category. Allowed: " + String.join(", ", CATEGORIES));
        }
    }

    private void apply(Item item, ItemRequest r) {
        item.setItemName(r.itemName().trim());
        item.setCategory(r.category().trim());
        item.setDescription(r.description().trim());
        item.setReportedDate(r.reportedDate());
        item.setLocation(r.location().trim());
        item.setContactInfo(clean(r.contactInfo()));
        item.setAdditionalDetails(clean(r.additionalDetails()));
    }

    private String clean(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    /** List view: no personal data and no identifying details. */
    private ItemResponse summary(Item i, User viewer) {
        boolean mine = viewer != null && i.getReporter().getId().equals(viewer.getId());
        return new ItemResponse(i.getId(), i.getItemName(), i.getCategory(), i.getDescription(),
                i.getItemType().name(), i.getLocation(), i.getReportedDate(), i.getImageUrl(),
                i.getStatus().name(), null, null, null, null, mine, false, i.getCreatedAt());
    }

    /** Detail view: what a logged-in viewer is allowed to see. */
    private ItemResponse detail(Item i, User viewer) {
        boolean mine = viewer != null && i.getReporter().getId().equals(viewer.getId());
        boolean admin = viewer != null && viewer.getRole() == Role.ADMIN;
        boolean privileged = mine || admin;

        // Lost items: finders need the contact. Found items: only owner/admin see it.
        String contact = (privileged || i.getItemType() == ItemType.LOST) ? i.getContactInfo() : null;
        // Identifying details are used to verify claims, so they stay private.
        String extra = privileged ? i.getAdditionalDetails() : null;
        boolean claimed = viewer != null && claimRepository.existsByItemIdAndClaimantId(i.getId(), viewer.getId());

        return new ItemResponse(i.getId(), i.getItemName(), i.getCategory(), i.getDescription(),
                i.getItemType().name(), i.getLocation(), i.getReportedDate(), i.getImageUrl(),
                i.getStatus().name(), i.getReporter().getId(), i.getReporter().getFullName(),
                contact, extra, mine, claimed, i.getCreatedAt());
    }
}