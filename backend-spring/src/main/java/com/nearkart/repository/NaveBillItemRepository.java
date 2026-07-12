package com.nearkart.repository;

import com.nearkart.entity.NaveBillItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface NaveBillItemRepository extends JpaRepository<NaveBillItem, UUID> {
    List<NaveBillItem> findByNaveBillId(UUID naveBillId);
}
