package com.hsbc.market.model;

/** Aggregate statistics across the whole dataset (or a filtered subset). */
public record MarketSummary(
        int count,
        double avgPrice,
        double medianPrice,
        double minPrice,
        double maxPrice,
        double avgPricePerSqft,
        double avgSquareFootage,
        double avgSchoolRating
) {}
