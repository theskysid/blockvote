package com.blockvote.service;

import com.blockvote.dto.CandidateRequest;
import com.blockvote.entity.Candidate;
import com.blockvote.entity.Election;
import com.blockvote.repository.CandidateRepository;
import com.blockvote.repository.ElectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;

    @Transactional
    public Election createElection() {
        Election election = new Election();
        election.setStatus("CREATED");
        election.setCreatedAt(LocalDateTime.now());
        return electionRepository.save(election);
    }

    @Transactional
    public Candidate addCandidate(CandidateRequest request) {
        Candidate candidate = new Candidate();
        candidate.setName(request.getName());
        candidate.setParty(request.getParty());
        candidate.setVoteCount(0);
        return candidateRepository.save(candidate);
    }

    @Transactional
    public Election startElection() {
        Election election = electionRepository.findTopByOrderByCreatedAtDesc()
                .orElseThrow(() -> new RuntimeException("No election found"));

        if (!"CREATED".equals(election.getStatus())) {
            throw new RuntimeException("Election already started or stopped");
        }

        election.setStatus("ACTIVE");
        election.setStartedAt(LocalDateTime.now());
        return electionRepository.save(election);
    }

    @Transactional
    public Election stopElection() {
        Election election = electionRepository.findTopByOrderByCreatedAtDesc()
                .orElseThrow(() -> new RuntimeException("No election found"));

        if (!"ACTIVE".equals(election.getStatus())) {
            throw new RuntimeException("Election is not active");
        }

        election.setStatus("STOPPED");
        election.setStoppedAt(LocalDateTime.now());
        return electionRepository.save(election);
    }

    public Map<String, Object> getResults() {
        List<Candidate> candidates = candidateRepository.findAll();

        int totalVotes = candidates.stream()
                .mapToInt(Candidate::getVoteCount)
                .sum();

        List<Map<String, Object>> results = candidates.stream()
                .map(c -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", c.getId());
                    result.put("name", c.getName());
                    result.put("party", c.getParty());
                    result.put("voteCount", c.getVoteCount());
                    return result;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("totalVotes", totalVotes);
        response.put("results", results);

        return response;
    }

    public Election getElectionStatus() {
        return electionRepository.findTopByOrderByCreatedAtDesc()
                .orElse(null);
    }
}
