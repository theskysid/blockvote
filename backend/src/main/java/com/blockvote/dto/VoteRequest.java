package com.blockvote.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoteRequest {
    private String mobileNumber;
    private Long candidateId;
    private String walletAddress;
}
