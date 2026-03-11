package com.agrocare.dto.response;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionListResponse {

    private List<QuestionResponse> questions;
    private PaginationDTO pagination;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaginationDTO {
        private int currentPage;
        private int totalPages;
        private long totalQuestions;
        private int perPage;
        private boolean hasNext;
        private boolean hasPrevious;
    }
}
