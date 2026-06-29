package com.hsbc.market.model;

/** One row of the housing dataset. */
public record Property(
        int id,
        double squareFootage,
        int bedrooms,
        double bathrooms,
        int yearBuilt,
        double lotSize,
        double distanceToCityCenter,
        double schoolRating,
        double price
) {
    public double pricePerSqft() {
        return squareFootage > 0 ? price / squareFootage : 0;
    }
}
