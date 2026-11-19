package com.github.yoruhinda.campushub.controller;

import com.github.yoruhinda.campushub.dto.VoteRequest;
import com.github.yoruhinda.campushub.dto.VoteSummaryResponse;
import com.github.yoruhinda.campushub.service.VoteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @GetMapping
    public VoteSummaryResponse summary(@PathVariable Long postId) {
        return voteService.getSummary(postId);
    }

    @PostMapping
    public VoteSummaryResponse vote(@PathVariable Long postId, @Valid @RequestBody VoteRequest request) {
        return voteService.vote(postId, request);
    }
}