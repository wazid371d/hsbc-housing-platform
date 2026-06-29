package com.hsbc.market.service;

import com.hsbc.market.model.Property;
import org.springframework.stereotype.Service;

import java.util.List;

/** Builds a CSV export of (optionally filtered) properties. */
@Service
public class ExportService {

    private static final String HEADER =
            "id,square_footage,bedrooms,bathrooms,year_built,lot_size,distance_to_city_center,school_rating,price,price_per_sqft";

    public String toCsv(List<Property> properties) {
        StringBuilder sb = new StringBuilder(HEADER).append("\n");
        for (Property p : properties) {
            sb.append(p.id()).append(',')
                    .append(fmt(p.squareFootage())).append(',')
                    .append(p.bedrooms()).append(',')
                    .append(fmt(p.bathrooms())).append(',')
                    .append(p.yearBuilt()).append(',')
                    .append(fmt(p.lotSize())).append(',')
                    .append(fmt(p.distanceToCityCenter())).append(',')
                    .append(fmt(p.schoolRating())).append(',')
                    .append(fmt(p.price())).append(',')
                    .append(fmt(Math.round(p.pricePerSqft() * 100) / 100.0))
                    .append('\n');
        }
        return sb.toString();
    }

    private static String fmt(double v) {
        // Render whole numbers without a trailing ".0".
        if (v == Math.rint(v)) {
            return Long.toString((long) v);
        }
        return Double.toString(v);
    }
}
