package com.github.yoruhinda.campushub.controller;

import com.github.yoruhinda.campushub.dto.CommentRequest;
import com.github.yoruhinda.campushub.dto.CommentResponse;
import com.github.yoruhinda.campushub.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public List<CommentResponse> list(@PathVariable Long postId) {
        return commentService.listByPost(postId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse add(@PathVariable Long postId, @Valid @RequestBody CommentRequest request) {
        return commentService.addComment(postId, request);
    }
}