package com.github.yoruhinda.campushub.dto;

import java.time.LocalDateTime;

public record CommunityResponse(
        Long id,
        String name,
        String description,
        LocalDateTime createdAt,
        long postCount
) {
}