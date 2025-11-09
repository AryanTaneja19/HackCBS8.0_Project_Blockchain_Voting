pragma solidity ^0.5.15;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        string party; 
        uint voteCount;
    }

    mapping (uint => Candidate) public candidates;
    mapping (address => bool) public voters;

    uint public countCandidates;
    uint256 public votingEnd;
    uint256 public votingStart;

    // ✅ Add events for debugging (optional)
    event CandidateAdded(uint id, string name, string party);
    event VoteCasted(address voter, uint candidateID);
    event VotingDatesSet(uint256 startDate, uint256 endDate);

    function addCandidate(string memory name, string memory party) public returns(uint) {
        countCandidates++;
        candidates[countCandidates] = Candidate(countCandidates, name, party, 0);
        emit CandidateAdded(countCandidates, name, party);
        return countCandidates;
    }

    function vote(uint candidateID) public {
        require(votingStart != 0 && votingEnd != 0, "Voting dates not set.");
        require(now >= votingStart, "Voting has not started yet.");
        require(now <= votingEnd, "Voting has ended.");
        require(candidateID > 0 && candidateID <= countCandidates, "Invalid candidate ID.");
        require(!voters[msg.sender], "You have already voted.");

        voters[msg.sender] = true;
        candidates[candidateID].voteCount++;
        emit VoteCasted(msg.sender, candidateID);
    }

    function checkVote() public view returns(bool) {
        return voters[msg.sender];
    }

    function getCountCandidates() public view returns(uint) {
        return countCandidates;
    }

    function getCandidate(uint candidateID) public view returns (uint, string memory, string memory, uint) {
        Candidate memory c = candidates[candidateID];
        return (c.id, c.name, c.party, c.voteCount);
    }

    function setDates(uint256 _startDate, uint256 _endDate) public {
        require(_endDate > _startDate, "End date must be after start date");
        require(_endDate > now, "End date must be in the future");

        votingStart = _startDate;
        votingEnd = _endDate;

        emit VotingDatesSet(_startDate, _endDate);
    }

    function getDates() public view returns (uint256, uint256) {
        return (votingStart, votingEnd);
    }
}
