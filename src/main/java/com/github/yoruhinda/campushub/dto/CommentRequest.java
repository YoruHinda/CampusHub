package com.github.yoruhinda.campushub.dto;

import jakarta.validation.constraints.NotBlank;

public record CommentRequest(
        @NotBlank(message = "O comentário não pode estar vazio")
        String content
) {
}