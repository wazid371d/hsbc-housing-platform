package com.hsbc.market.model;

/** Aggregate statistics for one market segment (e.g. "3 bedrooms" or "$200k–$300k"). */
public record SegmentStats(
        String segment,
        int count,
        double avgPrice,
        double minPrice,
        double maxPrice,
        double avgPricePerSqft,
        double avgSquareFootage
) {}
