package com.blockvote.controller;

import com.blockvote.dto.ApiResponse;
import com.blockvote.dto.CandidateRequest;
import com.blockvote.dto.ElectionRequest;
import com.blockvote.entity.Candidate;
import com.blockvote.entity.Election;
import com.blockvote.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/create-election")
    public ResponseEntity<ApiResponse> createElection(@RequestBody ElectionRequest request) {
        try {
            Election election = adminService.createElection(request.getTitle());
            return ResponseEntity.ok(new ApiResponse(true, "Election created successfully", election));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/add-candidate")
    public ResponseEntity<ApiResponse> addCandidate(@RequestBody CandidateRequest request) {
        try {
            Candidate candidate = adminService.addCandidate(request);
            return ResponseEntity.ok(new ApiResponse(true, "Candidate added successfully", candidate));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/start-election")
    public ResponseEntity<ApiResponse> startElection() {
        try {
            Election election = adminService.startElection();
            return ResponseEntity.ok(new ApiResponse(true, "Election started successfully", election));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/stop-election")
    public ResponseEntity<ApiResponse> stopElection() {
        try {
            Election election = adminService.stopElection();
            return ResponseEntity.ok(new ApiResponse(true, "Election stopped successfully", election));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/results")
    public ResponseEntity<ApiResponse> getResults() {
        try {
            Map<String, Object> results = adminService.getResults();
            return ResponseEntity.ok(new ApiResponse(true, "Results fetched successfully", results));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/election-status")
    public ResponseEntity<ApiResponse> getElectionStatus() {
        try {
            Election election = adminService.getElectionStatus();
            return ResponseEntity.ok(new ApiResponse(true, "Election status fetched", election));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/candidates")
    public ResponseEntity<ApiResponse> getCurrentCandidates() {
        try {
            var candidates = adminService.getCandidatesForCurrentElection();
            return ResponseEntity.ok(new ApiResponse(true, "Current election candidates fetched", candidates));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/reset-election")
    public ResponseEntity<ApiResponse> resetElection() {
        try {
            adminService.resetElection();
            return ResponseEntity
                    .ok(new ApiResponse(true, "Election reset successfully - ready to add new candidates"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Archive endpoints
    @GetMapping("/archive")
    public ResponseEntity<ApiResponse> getArchivedElections() {
        try {
            return ResponseEntity.ok(new ApiResponse(true, "Archived elections retrieved successfully", 
                    adminService.getArchivedElections()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/archive/{id}")
    public ResponseEntity<ApiResponse> getArchivedElection(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(new ApiResponse(true, "Election details retrieved successfully", 
                    adminService.getArchivedElectionById(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/archive/{id}/statistics")
    public ResponseEntity<ApiResponse> getElectionStatistics(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(new ApiResponse(true, "Election statistics retrieved successfully", 
                    adminService.getElectionStatistics(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
