package com.hsbc.market.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hsbc.market.model.WhatIfRequest;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/** Calls the Task 1 ML API. What-if predictions are cached by feature vector. */
@Service
public class MlClientService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public MlClientService(RestClient mlRestClient, ObjectMapper objectMapper) {
        this.restClient = mlRestClient;
        this.objectMapper = objectMapper;
    }

    /** DTOs mirroring the ML API /predict response. */
    public record MlPrediction(double predicted_price, double lower_bound, double upper_bound, boolean out_of_range) {}
    public record MlPredictResponse(List<MlPrediction> predictions, String model_version) {}

    @Cacheable(value = "predictions", key = "#request.toString()")
    public MlPrediction predict(WhatIfRequest request) {
        // Serialize explicitly to a JSON string so the body is always written, regardless
        // of which underlying request factory is selected.
        String payload;
        try {
            payload = objectMapper.writeValueAsString(Map.of("items", List.of(request)));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize prediction request", e);
        }

        MlPredictResponse response = restClient.post()
                .uri("/predict")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(MlPredictResponse.class);

        if (response == null || response.predictions() == null || response.predictions().isEmpty()) {
            throw new IllegalStateException("ML API returned no prediction");
        }
        return response.predictions().get(0);
    }
}
