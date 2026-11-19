package com.github.yoruhinda.campushub.dto;

import com.github.yoruhinda.campushub.enums.VoteType;
import jakarta.validation.constraints.NotNull;

public record VoteRequest(
        @NotNull(message = "O tipo do voto é obrigatório (UP ou DOWN)")
        VoteType type
) {
}