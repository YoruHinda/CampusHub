package com.github.yoruhinda.campushub.dto;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long postId,
        String content,
        LocalDateTime createdAt
) {
}