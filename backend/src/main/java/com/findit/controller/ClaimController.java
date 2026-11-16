package com.findit.controller;

import com.findit.dto.request.ClaimRequest;
import com.findit.dto.request.ReviewRequest;
import com.findit.dto.response.ClaimResponse;
import com.findit.entity.ClaimStatus;
import com.findit.security.UserPrincipal;
import com.findit.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** /api/claims : submit and review claims. */
@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping("/{itemId}")
    public ResponseEntity<ClaimResponse> submit(@PathVariable("itemId") Long itemId,
            @Valid @RequestBody ClaimRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(claimService.submit(itemId, request, principal));
    }

    @GetMapping("/my-claims")
    public List<ClaimResponse> myClaims(@AuthenticationPrincipal UserPrincipal principal) {
        return claimService.myClaims(principal);
    }

    /** Admin only. Optional filter: ?status=PENDING|APPROVED|REJECTED */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ClaimResponse> all(@RequestParam(name = "status", required = false) ClaimStatus status) {
        return claimService.all(status);
    }

    @GetMapping("/{id}")
    public ClaimResponse getById(@PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return claimService.getById(id, principal);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ClaimResponse approve(@PathVariable("id") Long id,
            @Valid @RequestBody(required = false) ReviewRequest request) {
        return claimService.approve(id, request == null ? null : request.remarks());
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ClaimResponse reject(@PathVariable("id") Long id,
            @Valid @RequestBody(required = false) ReviewRequest request) {
        return claimService.reject(id, request == null ? null : request.remarks());
    }
}


