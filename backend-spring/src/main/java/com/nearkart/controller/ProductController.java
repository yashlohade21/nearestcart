package com.nearkart.controller;

import com.nearkart.dto.product.*;
import com.nearkart.entity.Product;
import com.nearkart.repository.ProductRepository;
import com.nearkart.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@Transactional
public class ProductController {
    private final ProductRepository repo;
    public ProductController(ProductRepository repo) { this.repo = repo; }

    @GetMapping
    public List<ProductResponse> list(@RequestParam(required = false) String search,
                                      @RequestParam(defaultValue = "50") int limit,
                                      @RequestParam(defaultValue = "0") int offset,
                                      @AuthenticationPrincipal UserPrincipal p) {
        UUID uid = p.getEffectiveUserId();
        if (search != null && !search.isBlank())
            return repo.findByUserIdAndNameContainingIgnoreCase(uid, search, PageRequest.of(offset / Math.max(limit,1), limit)).stream().map(ProductResponse::from).toList();
        return repo.findByUserId(uid, PageRequest.of(offset / Math.max(limit,1), limit)).stream().map(ProductResponse::from).toList();
    }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductCreate b, @AuthenticationPrincipal UserPrincipal p) {
        Product pr = Product.builder().userId(p.getEffectiveUserId()).name(b.getName()).nameLocal(b.getNameLocal())
                .category(b.getCategory()).unit(b.getUnit()).hsnCode(b.getHsnCode())
                .purchasePrice(b.getPurchasePrice()).sellingPrice(b.getSellingPrice())
                .minStock(b.getMinStock()).currentStock(b.getCurrentStock())
                .isPerishable(b.getIsPerishable()).avgSpoilagePct(b.getAvgSpoilagePct()).build();
        return ProductResponse.from(repo.save(pr));
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal p) {
        return ProductResponse.from(repo.findByIdAndUserId(id, p.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found")));
    }

    @PatchMapping("/{id}")
    public ProductResponse update(@PathVariable UUID id, @RequestBody ProductUpdate b, @AuthenticationPrincipal UserPrincipal p) {
        Product pr = repo.findByIdAndUserId(id, p.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (b.getName() != null) pr.setName(b.getName());
        if (b.getNameLocal() != null) pr.setNameLocal(b.getNameLocal());
        if (b.getCategory() != null) pr.setCategory(b.getCategory());
        if (b.getUnit() != null) pr.setUnit(b.getUnit());
        if (b.getHsnCode() != null) pr.setHsnCode(b.getHsnCode());
        if (b.getPurchasePrice() != null) pr.setPurchasePrice(b.getPurchasePrice());
        if (b.getSellingPrice() != null) pr.setSellingPrice(b.getSellingPrice());
        if (b.getMinStock() != null) pr.setMinStock(b.getMinStock());
        if (b.getCurrentStock() != null) pr.setCurrentStock(b.getCurrentStock());
        if (b.getIsPerishable() != null) pr.setIsPerishable(b.getIsPerishable());
        if (b.getAvgSpoilagePct() != null) pr.setAvgSpoilagePct(b.getAvgSpoilagePct());
        if (b.getIsActive() != null) pr.setIsActive(b.getIsActive());
        return ProductResponse.from(repo.save(pr));
    }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal p) {
        Product pr = repo.findByIdAndUserId(id, p.getEffectiveUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        pr.setIsActive(false); repo.save(pr);
    }
}
