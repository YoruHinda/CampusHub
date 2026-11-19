package com.github.yoruhinda.campushub.dto;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        String title,
        String content,
        boolean pinned,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        long upvotes,
        long downvotes,
        long score,
        long commentCount,
        Long communityId,
        String communityName
) {
}