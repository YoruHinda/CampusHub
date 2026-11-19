package com.github.yoruhinda.campushub.service;

import com.github.yoruhinda.campushub.dto.CommentRequest;
import com.github.yoruhinda.campushub.dto.CommentResponse;
import com.github.yoruhinda.campushub.exception.ResourceNotFoundException;
import com.github.yoruhinda.campushub.model.Comment;
import com.github.yoruhinda.campushub.model.Post;
import com.github.yoruhinda.campushub.repository.CommentRepository;
import com.github.yoruhinda.campushub.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    public CommentService(CommentRepository commentRepository, PostRepository postRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
    }

    @Transactional
    public CommentResponse addComment(Long postId, CommentRequest request) {
        Post post = getPostOrThrow(postId);
        Comment comment = commentRepository.save(new Comment(request.content().trim(), post));
        return toResponse(comment, postId);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> listByPost(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Publicação não encontrada com id " + postId);
        }
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(c -> toResponse(c, postId))
                .toList();
    }

    private Post getPostOrThrow(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Publicação não encontrada com id " + postId));
    }

    private CommentResponse toResponse(Comment comment, Long postId) {
        return new CommentResponse(comment.getId(), postId, comment.getContent(), comment.getCreatedAt());
    }
}