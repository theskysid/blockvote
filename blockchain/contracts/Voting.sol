// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public hasVoted;
    mapping(address => bool) public authorizedVoters;
    
    uint256 public candidatesCount;
    address public admin;
    bool public votingActive;

    event VoteCast(address indexed voter, uint256 candidateId);
    event CandidateAdded(uint256 candidateId, string name);
    event VotingStarted();
    event VotingStopped();

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedVoters[msg.sender], "Not authorized to vote");
        _;
    }

    modifier votingIsActive() {
        require(votingActive, "Voting is not active");
        _;
    }

    constructor() {
        admin = msg.sender;
        votingActive = false;
    }

    function addCandidate(string memory _name) public onlyAdmin {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateAdded(candidatesCount, _name);
    }

    function authorizeVoter(address _voter) public onlyAdmin {
        authorizedVoters[_voter] = true;
    }

    function startVoting() public onlyAdmin {
        votingActive = true;
        emit VotingStarted();
    }

    function stopVoting() public onlyAdmin {
        votingActive = false;
        emit VotingStopped();
    }

    function vote(uint256 _candidateId) public onlyAuthorized votingIsActive {
        require(!hasVoted[msg.sender], "Already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit VoteCast(msg.sender, _candidateId);
    }

    function getCandidate(uint256 _candidateId) public view returns (uint256, string memory, uint256) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");
        Candidate memory candidate = candidates[_candidateId];
        return (candidate.id, candidate.name, candidate.voteCount);
    }

    function getCandidatesCount() public view returns (uint256) {
        return candidatesCount;
    }

    function getTotalVotes() public view returns (uint256) {
        uint256 totalVotes = 0;
        for (uint256 i = 1; i <= candidatesCount; i++) {
            totalVotes += candidates[i].voteCount;
        }
        return totalVotes;
    }
}