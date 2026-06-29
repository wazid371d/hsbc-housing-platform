package com.hsbc.market.service;

import com.hsbc.market.model.Property;
import com.hsbc.market.repository.CsvPropertyRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/** Read access to the dataset with filtering and sorting for the data tables. */
@Service
public class DatasetService {

    private final CsvPropertyRepository repository;

    public DatasetService(CsvPropertyRepository repository) {
        this.repository = repository;
    }

    public List<Property> findAll() {
        return repository.findAll();
    }

    public List<Property> query(Integer bedrooms, Double minPrice, Double maxPrice, String sort, String order) {
        Comparator<Property> comparator = comparatorFor(sort);
        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }
        return repository.findAll().stream()
                .filter(p -> bedrooms == null || p.bedrooms() == bedrooms)
                .filter(p -> minPrice == null || p.price() >= minPrice)
                .filter(p -> maxPrice == null || p.price() <= maxPrice)
                .sorted(comparator)
                .toList();
    }

    private Comparator<Property> comparatorFor(String sort) {
        String field = Optional.ofNullable(sort).orElse("id");
        return switch (field) {
            case "price" -> Comparator.comparingDouble(Property::price);
            case "square_footage" -> Comparator.comparingDouble(Property::squareFootage);
            case "bedrooms" -> Comparator.comparingInt(Property::bedrooms);
            case "year_built" -> Comparator.comparingInt(Property::yearBuilt);
            case "school_rating" -> Comparator.comparingDouble(Property::schoolRating);
            case "price_per_sqft" -> Comparator.comparingDouble(Property::pricePerSqft);
            default -> Comparator.comparingInt(Property::id);
        };
    }
}
