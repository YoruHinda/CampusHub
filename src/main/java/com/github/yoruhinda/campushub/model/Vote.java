package com.github.yoruhinda.campushub.model;

import com.github.yoruhinda.campushub.enums.VoteType;
import jakarta.persistence.*;

@Entity
@Table(name = "votes")
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private VoteType type;

    public Vote() {
    }

    public Vote(Post post, VoteType type) {
        this.post = post;
        this.type = type;
    }

    public Long getId() { return id; }

    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }

    public VoteType getType() { return type; }
    public void setType(VoteType type) { this.type = type; }
}