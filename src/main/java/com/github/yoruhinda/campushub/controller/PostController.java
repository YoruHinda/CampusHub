package com.github.yoruhinda.campushub.controller;

import com.github.yoruhinda.campushub.dto.PostRequest;
import com.github.yoruhinda.campushub.dto.PostResponse;
import com.github.yoruhinda.campushub.dto.PostUpdateRequest;
import com.github.yoruhinda.campushub.service.PostService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<PostResponse> create(@Valid @RequestBody PostRequest request) {
        PostResponse created = postService.create(request);
        return ResponseEntity.created(URI.create("/api/posts/" + created.id())).body(created);
    }

    // GET /api/posts                 -> todas
    // GET /api/posts?communityId=1   -> só da comunidade 1
    @GetMapping
    public List<PostResponse> list(@RequestParam(required = false) Long communityId) {
        return postService.findAll(communityId);
    }

    @GetMapping("/{id}")
    public PostResponse get(@PathVariable Long id) {
        return postService.findById(id);
    }

    @PutMapping("/{id}")
    public PostResponse update(@PathVariable Long id, @Valid @RequestBody PostUpdateRequest request) {
        return postService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        postService.delete(id);
    }

    @PatchMapping("/{id}/pin")
    public PostResponse pin(@PathVariable Long id) {
        return postService.pin(id);
    }

    @PatchMapping("/{id}/unpin")
    public PostResponse unpin(@PathVariable Long id) {
        return postService.unpin(id);
    }
}