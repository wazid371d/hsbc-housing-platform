package com.hsbc.market.service;

import com.hsbc.market.model.MarketSummary;
import com.hsbc.market.model.Property;
import com.hsbc.market.model.SegmentStats;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Aggregate statistics over the dataset. Results are cached (data is static). */
@Service
public class StatsService {

    private final DatasetService datasetService;

    public StatsService(DatasetService datasetService) {
        this.datasetService = datasetService;
    }

    @Cacheable("marketSummary")
    public MarketSummary summary() {
        List<Property> all = datasetService.findAll();
        if (all.isEmpty()) {
            return new MarketSummary(0, 0, 0, 0, 0, 0, 0, 0);
        }
        List<Double> prices = all.stream().map(Property::price).sorted().toList();
        return new MarketSummary(
                all.size(),
                avg(all, Property::price),
                median(prices),
                prices.get(0),
                prices.get(prices.size() - 1),
                avg(all, Property::pricePerSqft),
                avg(all, Property::squareFootage),
                avg(all, Property::schoolRating)
        );
    }

    @Cacheable(value = "segmentStats", key = "#by")
    public List<SegmentStats> segments(String by) {
        List<Property> all = datasetService.findAll();
        Function<Property, String> classifier = classifierFor(by);

        // Preserve a sensible segment order.
        Map<String, List<Property>> grouped = all.stream()
                .collect(Collectors.groupingBy(classifier, LinkedHashMap::new, Collectors.toList()));

        List<SegmentStats> result = new ArrayList<>();
        grouped.forEach((segment, items) -> {
            List<Double> prices = items.stream().map(Property::price).sorted().toList();
            result.add(new SegmentStats(
                    segment,
                    items.size(),
                    avg(items, Property::price),
                    prices.get(0),
                    prices.get(prices.size() - 1),
                    avg(items, Property::pricePerSqft),
                    avg(items, Property::squareFootage)
            ));
        });
        result.sort(Comparator.comparing(SegmentStats::segment));
        return result;
    }

    /** Average price for the segment a what-if property falls into (by bedrooms). */
    public double avgPriceForBedrooms(int bedrooms) {
        List<Property> matching = datasetService.findAll().stream()
                .filter(p -> p.bedrooms() == bedrooms)
                .toList();
        if (matching.isEmpty()) {
            return summary().avgPrice();
        }
        return avg(matching, Property::price);
    }

    private Function<Property, String> classifierFor(String by) {
        String dim = by == null ? "bedrooms" : by;
        return switch (dim) {
            case "price_band" -> StatsService::priceBand;
            case "school_tier" -> StatsService::schoolTier;
            default -> p -> p.bedrooms() + " bd";
        };
    }

    private static String priceBand(Property p) {
        double price = p.price();
        if (price < 200_000) return "< $200k";
        if (price < 300_000) return "$200k–$300k";
        if (price < 400_000) return "$300k–$400k";
        return "$400k+";
    }

    private static String schoolTier(Property p) {
        double r = p.schoolRating();
        if (r < 7) return "< 7.0";
        if (r < 8) return "7.0–8.0";
        if (r < 9) return "8.0–9.0";
        return "9.0+";
    }

    private static double avg(List<Property> items, Function<Property, Double> field) {
        return items.stream().mapToDouble(field::apply).average().orElse(0);
    }

    private static double median(List<Double> sorted) {
        int n = sorted.size();
        if (n == 0) return 0;
        if (n % 2 == 1) return sorted.get(n / 2);
        return (sorted.get(n / 2 - 1) + sorted.get(n / 2)) / 2.0;
    }
}
