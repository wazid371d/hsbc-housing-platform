package com.hsbc.market.repository;

import com.hsbc.market.model.Property;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads the housing dataset from the classpath once at startup into an in-memory list.
 * The dataset is small and static, so this is sufficient and fast.
 */
@Repository
public class CsvPropertyRepository {

    private final ResourceLoader resourceLoader;

    @Value("${dataset.path:classpath:data/house_price_dataset.csv}")
    private String datasetPath;

    private List<Property> properties = List.of();

    public CsvPropertyRepository(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @PostConstruct
    void load() throws IOException, CsvValidationException {
        Resource resource = resourceLoader.getResource(datasetPath);
        List<Property> parsed = new ArrayList<>();
        try (Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
             CSVReader csv = new CSVReader(reader)) {

            String[] header = csv.readNext();
            if (header == null) {
                throw new IllegalStateException("Dataset is empty: " + datasetPath);
            }
            Map<String, Integer> col = headerIndex(header);

            String[] row;
            while ((row = csv.readNext()) != null) {
                if (row.length == 0 || (row.length == 1 && row[0].isBlank())) continue;
                parsed.add(new Property(
                        (int) parseD(row, col, "id"),
                        parseD(row, col, "square_footage"),
                        (int) parseD(row, col, "bedrooms"),
                        parseD(row, col, "bathrooms"),
                        (int) parseD(row, col, "year_built"),
                        parseD(row, col, "lot_size"),
                        parseD(row, col, "distance_to_city_center"),
                        parseD(row, col, "school_rating"),
                        parseD(row, col, "price")
                ));
            }
        }
        this.properties = Collections.unmodifiableList(parsed);
    }

    public List<Property> findAll() {
        return properties;
    }

    private static Map<String, Integer> headerIndex(String[] header) {
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < header.length; i++) {
            String name = header[i].trim();
            // Strip a leading UTF-8 BOM that may prefix the first column name.
            if (!name.isEmpty() && name.charAt(0) == '﻿') {
                name = name.substring(1);
            }
            map.put(name, i);
        }
        return map;
    }

    private static double parseD(String[] row, Map<String, Integer> col, String name) {
        Integer idx = col.get(name);
        if (idx == null || idx >= row.length) {
            throw new IllegalStateException("Missing column '" + name + "' in dataset");
        }
        return Double.parseDouble(row[idx].trim());
    }
}
