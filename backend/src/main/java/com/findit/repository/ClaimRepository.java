package com.findit.repository;

import com.findit.entity.Claim;
import com.findit.entity.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {

    /** Used to block duplicate claims (a student may claim an item only once). */
    boolean existsByItemIdAndClaimantId(Long itemId, Long claimantId);

    List<Claim> findByClaimantIdOrderByCreatedAtDesc(Long claimantId);

    List<Claim> findAllByOrderByCreatedAtDesc();

    List<Claim> findByStatusOrderByCreatedAtDesc(ClaimStatus status);

    List<Claim> findByItemIdAndStatus(Long itemId, ClaimStatus status);

    long countByStatus(ClaimStatus status);

    long countByClaimantIdAndStatus(Long claimantId, ClaimStatus status);
}
