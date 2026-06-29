package com.hsbc.market;

import com.hsbc.market.controller.MarketController;
import com.hsbc.market.model.MarketSummary;
import com.hsbc.market.service.DatasetService;
import com.hsbc.market.service.StatsService;
import com.hsbc.market.service.WhatIfService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MarketController.class)
class MarketControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    StatsService statsService;

    @MockitoBean
    DatasetService datasetService;

    @MockitoBean
    WhatIfService whatIfService;

    @Test
    void statsReturns200AndJson() throws Exception {
        MarketSummary summary = new MarketSummary(50, 250000, 240000, 160000, 410000, 150, 1800, 7.5);
        when(statsService.summary()).thenReturn(summary);

        mockMvc.perform(get("/api/market/stats"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.count").value(50))
                .andExpect(jsonPath("$.maxPrice").value(410000.0));
    }
}
