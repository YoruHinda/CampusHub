package com.github.yoruhinda.campushub.controller;

import com.github.yoruhinda.campushub.dto.CommunityRequest;
import com.github.yoruhinda.campushub.dto.CommunityResponse;
import com.github.yoruhinda.campushub.service.CommunityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/communities")
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    @PostMapping
    public ResponseEntity<CommunityResponse> create(@Valid @RequestBody CommunityRequest request) {
        CommunityResponse created = communityService.create(request);
        return ResponseEntity.created(URI.create("/api/communities/" + created.id())).body(created);
    }

    @GetMapping
    public List<CommunityResponse> list() {
        return communityService.findAll();
    }

    @GetMapping("/{id}")
    public CommunityResponse get(@PathVariable Long id) {
        return communityService.findById(id);
    }

    @PutMapping("/{id}")
    public CommunityResponse update(@PathVariable Long id, @Valid @RequestBody CommunityRequest request) {
        return communityService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        communityService.delete(id);
    }
}