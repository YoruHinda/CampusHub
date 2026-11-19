package com.github.yoruhinda.campushub.service;

import com.github.yoruhinda.campushub.dto.VoteRequest;
import com.github.yoruhinda.campushub.dto.VoteSummaryResponse;
import com.github.yoruhinda.campushub.enums.VoteType;
import com.github.yoruhinda.campushub.exception.ResourceNotFoundException;
import com.github.yoruhinda.campushub.model.Post;
import com.github.yoruhinda.campushub.model.Vote;
import com.github.yoruhinda.campushub.repository.PostRepository;
import com.github.yoruhinda.campushub.repository.VoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final PostRepository postRepository;

    public VoteService(VoteRepository voteRepository, PostRepository postRepository) {
        this.voteRepository = voteRepository;
        this.postRepository = postRepository;
    }

    @Transactional
    public VoteSummaryResponse vote(Long postId, VoteRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Publicação não encontrada com id " + postId));

        voteRepository.save(new Vote(post, request.type()));
        return summary(postId);
    }

    @Transactional(readOnly = true)
    public VoteSummaryResponse getSummary(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Publicação não encontrada com id " + postId);
        }
        return summary(postId);
    }

    private VoteSummaryResponse summary(Long postId) {
        long up = voteRepository.countByPostIdAndType(postId, VoteType.UP);
        long down = voteRepository.countByPostIdAndType(postId, VoteType.DOWN);
        return new VoteSummaryResponse(postId, up, down, up - down);
    }
}