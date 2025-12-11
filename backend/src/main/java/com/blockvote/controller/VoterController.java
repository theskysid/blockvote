package com.blockvote.controller;

import com.blockvote.dto.ApiResponse;
import com.blockvote.dto.VoteRequest;
import com.blockvote.entity.Candidate;
import com.blockvote.entity.Vote;
import com.blockvote.service.VoterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/voter")
@RequiredArgsConstructor
public class VoterController {

    private final VoterService voterService;

    @GetMapping("/candidates")
    public ResponseEntity<ApiResponse> getCandidates() {
        try {
            List<Candidate> candidates = voterService.getCandidates();
            return ResponseEntity.ok(new ApiResponse(true, "Candidates fetched successfully", candidates));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/vote")
    public ResponseEntity<ApiResponse> castVote(@RequestBody VoteRequest request) {
        try {
            Vote vote = voterService.castVote(request);
            return ResponseEntity.ok(new ApiResponse(true, "Vote cast successfully", vote));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/has-voted/{mobileNumber}")
    public ResponseEntity<ApiResponse> hasVoted(@PathVariable String mobileNumber) {
        try {
            boolean hasVoted = voterService.hasVoted(mobileNumber);
            return ResponseEntity.ok(new ApiResponse(true, "Vote status fetched", hasVoted));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
