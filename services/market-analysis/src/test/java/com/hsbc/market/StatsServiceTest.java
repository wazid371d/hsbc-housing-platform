package com.hsbc.market;

import com.hsbc.market.model.MarketSummary;
import com.hsbc.market.model.SegmentStats;
import com.hsbc.market.service.StatsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class StatsServiceTest {

    @Autowired
    StatsService statsService;

    @Test
    void summaryReflectsDataset() {
        MarketSummary summary = statsService.summary();
        assertThat(summary.count()).isEqualTo(50);
        assertThat(summary.minPrice()).isEqualTo(160000);
        assertThat(summary.maxPrice()).isEqualTo(410000);
        assertThat(summary.avgPrice()).isBetween(160000.0, 410000.0);
    }

    @Test
    void segmentsByBedroomsCoverAllRows() {
        List<SegmentStats> segments = statsService.segments("bedrooms");
        assertThat(segments).isNotEmpty();
        assertThat(segments.stream().mapToInt(SegmentStats::count).sum()).isEqualTo(50);
    }

    @Test
    void segmentsByPriceBand() {
        List<SegmentStats> segments = statsService.segments("price_band");
        assertThat(segments.stream().mapToInt(SegmentStats::count).sum()).isEqualTo(50);
    }
}
