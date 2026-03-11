package com.agrocare.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Long id;
    private String name;
    private String slug;
    private String icon;
    private String colorCode;
    private String description;
    private int questionCount;
    private LocalDateTime createdAt;
}
