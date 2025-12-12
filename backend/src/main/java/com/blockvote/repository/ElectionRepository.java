package com.blockvote.repository;

import com.blockvote.entity.Election;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ElectionRepository extends JpaRepository<Election, Long> {
    Optional<Election> findTopByOrderByCreatedAtDesc();

    List<Election> findByStatus(String status);

    Optional<Election> findByStatusOrderByCreatedAtDesc(String status);
    
    // Archive related queries
    List<Election> findByStatusOrderByStoppedAtDesc(String status);
    
    List<Election> findByStatusInOrderByStoppedAtDesc(List<String> statuses);
    
    Optional<Election> findByIdAndStatus(Long id, String status);
}
