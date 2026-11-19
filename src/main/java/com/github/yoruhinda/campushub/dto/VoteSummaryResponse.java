package com.github.yoruhinda.campushub.dto;

public record VoteSummaryResponse(
        Long postId,
        long upvotes,
        long downvotes,
        long score
) {}