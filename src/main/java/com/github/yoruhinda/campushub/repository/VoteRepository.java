package com.github.yoruhinda.campushub.repository;


import com.github.yoruhinda.campushub.enums.VoteType;
import com.github.yoruhinda.campushub.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    long countByPostIdAndType(Long postId, VoteType type);
}