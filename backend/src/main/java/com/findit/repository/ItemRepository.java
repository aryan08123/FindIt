package com.findit.repository;

import com.findit.entity.Item;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {

        List<Item> findByReporterIdOrderByCreatedAtDesc(Long userId);

        List<Item> findAllByOrderByCreatedAtDesc();

        List<Item> findTop8ByOrderByCreatedAtDesc();

        long countByItemType(ItemType itemType);

        long countByStatus(ItemStatus status);

        long countByReporterIdAndItemType(Long userId, ItemType itemType);
}