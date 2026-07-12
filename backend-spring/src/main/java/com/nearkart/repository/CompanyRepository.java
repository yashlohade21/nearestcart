package com.nearkart.repository;

import com.nearkart.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {
    List<Company> findByUserIdOrderByNameAsc(UUID userId);
    Optional<Company> findByIdAndUserId(UUID id, UUID userId);
    Optional<Company> findByUserIdAndIsDefaultTrue(UUID userId);
}
