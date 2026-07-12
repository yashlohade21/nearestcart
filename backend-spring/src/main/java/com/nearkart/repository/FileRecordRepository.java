package com.nearkart.repository;

import com.nearkart.entity.FileRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FileRecordRepository extends JpaRepository<FileRecord, UUID> {
    List<FileRecord> findByEntityTypeAndEntityId(String entityType, UUID entityId);
    List<FileRecord> findByUserId(UUID userId);
}
