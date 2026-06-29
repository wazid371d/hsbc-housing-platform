package com.hsbc.market.model;

/** Feature payload for the what-if tool. Field names match the ML API contract. */
public record WhatIfRequest(
        double square_footage,
        int bedrooms,
        double bathrooms,
        int year_built,
        double lot_size,
        double distance_to_city_center,
        double school_rating
) {}
