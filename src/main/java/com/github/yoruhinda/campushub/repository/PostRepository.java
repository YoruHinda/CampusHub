package com.github.yoruhinda.campushub.repository;

import com.github.yoruhinda.campushub.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findAllByOrderByPinnedDescCreatedAtDesc();

    List<Post> findByCommunityIdOrderByPinnedDescCreatedAtDesc(Long communityId);

    long countByCommunityId(Long communityId);
}