package com.findit.controller;

import com.findit.dto.response.DashboardResponse;
import com.findit.dto.response.ItemResponse;
import com.findit.dto.response.MessageResponse;
import com.findit.dto.response.UserResponse;
import com.findit.security.UserPrincipal;
import com.findit.service.AdminService;
import com.findit.service.ItemService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * /api/admin : dashboard, users and reports. ADMIN only (checked in
 * SecurityConfig and again here).
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final ItemService itemService;

    public AdminController(AdminService adminService, ItemService itemService) {
        this.adminService = adminService;
        this.itemService = itemService;
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return adminService.dashboard();
    }

    @GetMapping("/users")
    public List<UserResponse> users() {
        return adminService.users();
    }

    @DeleteMapping("/users/{id}")
    public MessageResponse deleteUser(@PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        adminService.deleteUser(id, principal);
        return new MessageResponse("User deleted successfully");
    }

    @GetMapping("/reports")
    public List<ItemResponse> reports(@AuthenticationPrincipal UserPrincipal principal) {
        return itemService.allReports(principal);
    }
}


