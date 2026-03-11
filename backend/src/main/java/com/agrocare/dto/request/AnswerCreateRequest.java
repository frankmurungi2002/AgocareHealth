package com.agrocare.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerCreateRequest {

    @NotBlank(message = "Answer content is required")
    @Size(min = 20, message = "Answer must be at least 20 characters")
    private String content;
}
