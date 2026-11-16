package com.findit.controller;

import com.findit.dto.response.ItemResponse;
import com.findit.dto.response.PublicStatsResponse;
import com.findit.service.ItemService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Public endpoints used by the landing page. */
@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final ItemService itemService;

    public PublicController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping("/stats")
    public PublicStatsResponse stats() {
        return itemService.publicStats();
    }

    @GetMapping("/recent-items")
    public List<ItemResponse> recentItems() {
        return itemService.recentItems();
    }

    @GetMapping("/categories")
    public List<String> categories() {
        return ItemService.CATEGORIES;
    }
}

