package com.github.yoruhinda.campushub.service;

import com.github.yoruhinda.campushub.dto.PostRequest;
import com.github.yoruhinda.campushub.dto.PostResponse;
import com.github.yoruhinda.campushub.dto.PostUpdateRequest;
import com.github.yoruhinda.campushub.enums.VoteType;
import com.github.yoruhinda.campushub.exception.ResourceNotFoundException;
import com.github.yoruhinda.campushub.model.Community;
import com.github.yoruhinda.campushub.model.Post;
import com.github.yoruhinda.campushub.repository.CommentRepository;
import com.github.yoruhinda.campushub.repository.CommunityRepository;
import com.github.yoruhinda.campushub.repository.PostRepository;
import com.github.yoruhinda.campushub.repository.VoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final VoteRepository voteRepository;
    private final CommunityRepository communityRepository;

    public PostService(PostRepository postRepository,
                       CommentRepository commentRepository,
                       VoteRepository voteRepository,
                       CommunityRepository communityRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.voteRepository = voteRepository;
        this.communityRepository = communityRepository;
    }

    @Transactional
    public PostResponse create(PostRequest request) {
        Community community = getCommunityOrThrow(request.communityId());
        Post post = new Post(request.title().trim(), request.content().trim(), community);
        return toResponse(postRepository.save(post));
    }

    /** Lista todas as publicações, ou apenas as de uma comunidade quando communityId é informado. */
    @Transactional(readOnly = true)
    public List<PostResponse> findAll(Long communityId) {
        List<Post> posts;
        if (communityId == null) {
            posts = postRepository.findAllByOrderByPinnedDescCreatedAtDesc();
        } else {
            getCommunityOrThrow(communityId); // 404 se a comunidade não existir
            posts = postRepository.findByCommunityIdOrderByPinnedDescCreatedAtDesc(communityId);
        }
        return posts.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PostResponse findById(Long id) {
        return toResponse(getPostOrThrow(id));
    }

    @Transactional
    public PostResponse update(Long id, PostUpdateRequest request) {
        Post post = getPostOrThrow(id);
        post.setTitle(request.title().trim());
        post.setContent(request.content().trim());
        post.setUpdatedAt(LocalDateTime.now());
        return toResponse(postRepository.save(post));
    }

    @Transactional
    public void delete(Long id) {
        postRepository.delete(getPostOrThrow(id));
    }

    @Transactional
    public PostResponse pin(Long id) {
        return setPinned(id, true);
    }

    @Transactional
    public PostResponse unpin(Long id) {
        return setPinned(id, false);
    }

    // ---------- helpers ----------

    private PostResponse setPinned(Long id, boolean pinned) {
        Post post = getPostOrThrow(id);
        post.setPinned(pinned);
        return toResponse(postRepository.save(post));
    }

    private Post getPostOrThrow(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Publicação não encontrada com id " + id));
    }

    private Community getCommunityOrThrow(Long id) {
        return communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comunidade não encontrada com id " + id));
    }

    private PostResponse toResponse(Post post) {
        long up = voteRepository.countByPostIdAndType(post.getId(), VoteType.UP);
        long down = voteRepository.countByPostIdAndType(post.getId(), VoteType.DOWN);
        long comments = commentRepository.countByPostId(post.getId());

        Community community = post.getCommunity();

        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.isPinned(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                up,
                down,
                up - down,
                comments,
                community != null ? community.getId() : null,
                community != null ? community.getName() : null
        );
    }
}