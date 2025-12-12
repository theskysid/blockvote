package com.blockvote.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "elections")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Election {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title; // Election title

    @Column(nullable = false)
    private String status; // CREATED, ACTIVE, STOPPED

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime startedAt;

    private LocalDateTime stoppedAt;

    // Results stored as JSON string when election is completed
    @Column(columnDefinition = "TEXT")
    private String finalResults;

    @Column(nullable = false)
    private Integer totalVotes = 0;

    // One-to-many relationship with candidates
    @OneToMany(mappedBy = "election", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private java.util.List<Candidate> candidates = new java.util.ArrayList<>();
}
