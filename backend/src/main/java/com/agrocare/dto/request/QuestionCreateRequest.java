package com.agrocare.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 10, max = 255, message = "Title must be between 10 and 255 characters")
    private String title;

    @NotBlank(message = "Body is required")
    @Size(min = 20, message = "Body must be at least 20 characters")
    private String body;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @Builder.Default
    private Boolean isAnonymous = false;
}
