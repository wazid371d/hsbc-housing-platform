package com.hsbc.market.model;

/** What-if result: the model prediction plus how it compares to the relevant segment. */
public record WhatIfResponse(
        double predictedPrice,
        double lowerBound,
        double upperBound,
        boolean outOfRange,
        String comparedSegment,
        double segmentAvgPrice,
        double differenceFromSegmentAvg
) {}
