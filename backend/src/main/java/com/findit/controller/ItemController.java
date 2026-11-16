package com.findit.controller;

import com.findit.dto.request.ItemRequest;
import com.findit.dto.request.StatusRequest;
import com.findit.dto.response.ItemResponse;
import com.findit.dto.response.MessageResponse;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.security.UserPrincipal;
import com.findit.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * /api/items : report, browse, view, edit, delete and change status of
 * lost/found items.
 */
@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    // ---------- create (multipart/form-data: text fields + optional "image" file)
    // ----------

    @PostMapping("/lost")
    public ResponseEntity<ItemResponse> reportLost(@Valid @ModelAttribute ItemRequest request,
            @RequestParam(name = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(itemService.create(request, image, ItemType.LOST, principal));
    }

    @PostMapping("/found")
    public ResponseEntity<ItemResponse> reportFound(@Valid @ModelAttribute ItemRequest request,
            @RequestParam(name = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(itemService.create(request, image, ItemType.FOUND, principal));
    }

    // ---------- browse (public; every filter is optional) ----------

    @GetMapping
    public List<ItemResponse> all(@RequestParam(name = "type", required = false) ItemType type,
            @RequestParam(name = "status", required = false) ItemStatus status,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "location", required = false) String location,
            @AuthenticationPrincipal UserPrincipal principal) {
        return itemService.search(type, status, category, keyword, location, principal);
    }

    @GetMapping("/lost")
    public List<ItemResponse> lost(@RequestParam(name = "status", required = false) ItemStatus status,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "location", required = false) String location,
            @AuthenticationPrincipal UserPrincipal principal) {
        return itemService.search(ItemType.LOST, status, category, keyword, location, principal);
    }

    @GetMapping("/found")
    public List<ItemResponse> found(@RequestParam(name = "status", required = false) ItemStatus status,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "location", required = false) String location,
            @AuthenticationPrincipal UserPrincipal principal) {
        return itemService.search(ItemType.FOUND, status, category, keyword, location, principal);
    }

    // ---------- logged-in only ----------

    @GetMapping("/my-reports")
    public List<ItemResponse> myReports(@AuthenticationPrincipal UserPrincipal principal) {
        return itemService.myReports(principal);
    }

    @GetMapping("/{id}")
    public ItemResponse getById(@PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return itemService.getById(id, principal);
    }

    @PutMapping("/{id}")
    public ItemResponse update(@PathVariable("id") Long id,
            @Valid @ModelAttribute ItemRequest request,
            @RequestParam(name = "image", required = false) MultipartFile image,
            @RequestParam(name = "removeImage", defaultValue = "false") boolean removeImage,
            @AuthenticationPrincipal UserPrincipal principal) {
        return itemService.update(id, request, image, removeImage, principal);
    }

    @PatchMapping("/{id}/status")
    public ItemResponse updateStatus(@PathVariable("id") Long id,
            @Valid @RequestBody StatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return itemService.updateStatus(id, request.status(), principal);
    }

    @DeleteMapping("/{id}")
    public MessageResponse delete(@PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        itemService.delete(id, principal);
        return new MessageResponse("Report deleted successfully");
    }
}

