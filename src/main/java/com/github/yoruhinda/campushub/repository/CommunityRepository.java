package com.github.yoruhinda.campushub.repository;

import com.github.yoruhinda.campushub.model.Community;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityRepository extends JpaRepository<Community, Long> {

    List<Community> findAllByOrderByNameAsc();

    Optional<Community> findByNameIgnoreCase(String name);
}