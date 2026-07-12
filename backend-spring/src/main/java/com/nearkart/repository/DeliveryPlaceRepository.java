package com.nearkart.repository;

import com.nearkart.entity.DeliveryPlace;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeliveryPlaceRepository extends JpaRepository<DeliveryPlace, UUID> {
    List<DeliveryPlace> findByUserIdOrderByPlaceNameAsc(UUID userId);
    Optional<DeliveryPlace> findByIdAndUserId(UUID id, UUID userId);
}
