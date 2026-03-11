package com.agrocare.service;

import com.agrocare.dto.response.CategoryResponse;
import com.agrocare.exception.ApiException;
import com.agrocare.model.sql.Category;
import com.agrocare.repository.sql.CategoryRepository;
import com.agrocare.util.QaMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Q&A categories.
 */
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final QaMapper mapper;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc().stream()
                .map(mapper::toCategoryResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> ApiException.notFound("Category not found: " + slug));
        return mapper.toCategoryResponse(category);
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Category not found: " + id));
        return mapper.toCategoryResponse(category);
    }
}
