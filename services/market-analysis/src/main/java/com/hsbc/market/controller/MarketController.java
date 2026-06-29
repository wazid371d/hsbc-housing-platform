package com.hsbc.market.controller;

import com.hsbc.market.model.MarketSummary;
import com.hsbc.market.model.Property;
import com.hsbc.market.model.SegmentStats;
import com.hsbc.market.model.WhatIfRequest;
import com.hsbc.market.model.WhatIfResponse;
import com.hsbc.market.service.DatasetService;
import com.hsbc.market.service.StatsService;
import com.hsbc.market.service.WhatIfService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    private final StatsService statsService;
    private final DatasetService datasetService;
    private final WhatIfService whatIfService;

    public MarketController(StatsService statsService, DatasetService datasetService, WhatIfService whatIfService) {
        this.statsService = statsService;
        this.datasetService = datasetService;
        this.whatIfService = whatIfService;
    }

    @GetMapping("/stats")
    public MarketSummary stats() {
        return statsService.summary();
    }

    @GetMapping("/segments")
    public List<SegmentStats> segments(@RequestParam(defaultValue = "bedrooms") String by) {
        return statsService.segments(by);
    }

    @GetMapping("/properties")
    public List<Property> properties(
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String order) {
        return datasetService.query(bedrooms, minPrice, maxPrice, sort, order);
    }

    @PostMapping("/whatif")
    public WhatIfResponse whatIf(@RequestBody WhatIfRequest request) {
        return whatIfService.analyze(request);
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }
}
