package com.agrocare.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionUpdateRequest {

    @Size(min = 10, max = 255, message = "Title must be between 10 and 255 characters")
    private String title;

    @Size(min = 20, message = "Body must be at least 20 characters")
    private String body;

    private Long categoryId;
}
