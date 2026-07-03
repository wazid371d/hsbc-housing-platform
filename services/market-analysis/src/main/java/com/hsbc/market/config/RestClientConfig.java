package com.hsbc.market.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${ml.api.url:http://localhost:8000}")
    private String mlApiUrl;

    @Value("${ml.api.key:}")
    private String mlApiKey;

    @Bean
    public RestClient mlRestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(10000);
        RestClient.Builder builder = RestClient.builder()
                .baseUrl(mlApiUrl)
                .requestFactory(factory);
        // Forward the shared secret only when one is configured.
        if (mlApiKey != null && !mlApiKey.isBlank()) {
            builder.defaultHeader("X-API-Key", mlApiKey);
        }
        return builder.build();
    }
}
