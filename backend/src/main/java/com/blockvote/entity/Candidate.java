package com.blockvote.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "candidates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String party;

    @Column(nullable = false)
    private Integer voteCount = 0;

    // Link to specific election
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "election_id")
    @JsonBackReference
    private Election election;

    @Column(name = "election_id", insertable = false, updatable = false)
    private Long electionId;

    @Column(nullable = false)
    private Boolean isActive = true; // Whether this candidate is active in current election
}
