package com.github.yoruhinda.campushub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PostRequest(
        @NotBlank(message = "O título é obrigatório")
        @Size(max = 200, message = "O título deve ter no máximo 200 caracteres")
        String title,

        @NotBlank(message = "O conteúdo é obrigatório")
        String content,

        @NotNull(message = "A comunidade é obrigatória")
        Long communityId
) {
}