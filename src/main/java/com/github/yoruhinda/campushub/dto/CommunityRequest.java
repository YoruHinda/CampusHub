package com.github.yoruhinda.campushub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommunityRequest(
        @NotBlank(message = "O nome da comunidade é obrigatório")
        @Size(min = 3, max = 60, message = "O nome deve ter entre 3 e 60 caracteres")
        String name,

        @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres")
        String description
) {
}