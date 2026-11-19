package com.github.yoruhinda.campushub.service;

import com.github.yoruhinda.campushub.dto.CommunityRequest;
import com.github.yoruhinda.campushub.dto.CommunityResponse;
import com.github.yoruhinda.campushub.exception.ConflictException;
import com.github.yoruhinda.campushub.exception.ResourceNotFoundException;
import com.github.yoruhinda.campushub.model.Community;
import com.github.yoruhinda.campushub.repository.CommunityRepository;
import com.github.yoruhinda.campushub.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final PostRepository postRepository;

    public CommunityService(CommunityRepository communityRepository, PostRepository postRepository) {
        this.communityRepository = communityRepository;
        this.postRepository = postRepository;
    }

    @Transactional
    public CommunityResponse create(CommunityRequest request) {
        String name = request.name().trim();
        if (communityRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new ConflictException("Já existe uma comunidade com o nome \"" + name + "\"");
        }
        Community community = new Community(name, normalize(request.description()));
        return toResponse(communityRepository.save(community));
    }

    @Transactional(readOnly = true)
    public List<CommunityResponse> findAll() {
        return communityRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CommunityResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public CommunityResponse update(Long id, CommunityRequest request) {
        Community community = getOrThrow(id);
        String name = request.name().trim();

        communityRepository.findByNameIgnoreCase(name)
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> {
                    throw new ConflictException("Já existe uma comunidade com o nome \"" + name + "\"");
                });

        community.setName(name);
        community.setDescription(normalize(request.description()));
        return toResponse(communityRepository.save(community));
    }

    @Transactional
    public void delete(Long id) {
        Community community = getOrThrow(id);
        if (postRepository.countByCommunityId(id) > 0) {
            throw new ConflictException("Não é possível excluir uma comunidade que possui publicações");
        }
        communityRepository.delete(community);
    }

    // ---------- helpers ----------

    private Community getOrThrow(Long id) {
        return communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comunidade não encontrada com id " + id));
    }

    private String normalize(String text) {
        return (text == null || text.isBlank()) ? null : text.trim();
    }

    private CommunityResponse toResponse(Community c) {
        return new CommunityResponse(
                c.getId(),
                c.getName(),
                c.getDescription(),
                c.getCreatedAt(),
                postRepository.countByCommunityId(c.getId())
        );
    }
}