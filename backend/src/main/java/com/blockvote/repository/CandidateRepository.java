package com.blockvote.repository;

import com.blockvote.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    // Find candidates for a specific election
    List<Candidate> findByElectionIdAndIsActiveTrue(Long electionId);

    // Find all candidates for a specific election (including inactive)
    List<Candidate> findByElectionId(Long electionId);

    // Delete all candidates for a specific election
    void deleteByElectionId(Long electionId);

    // Reset vote counts for an election
    @Modifying
    @Transactional
    @Query("UPDATE Candidate c SET c.voteCount = 0 WHERE c.electionId = :electionId")
    void resetVoteCountsByElectionId(@Param("electionId") Long electionId);
}
