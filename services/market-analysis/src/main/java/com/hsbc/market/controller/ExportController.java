package com.hsbc.market.controller;

import com.hsbc.market.model.Property;
import com.hsbc.market.service.DatasetService;
import com.hsbc.market.service.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/market/export")
public class ExportController {

    private final DatasetService datasetService;
    private final ExportService exportService;

    public ExportController(DatasetService datasetService, ExportService exportService) {
        this.datasetService = datasetService;
        this.exportService = exportService;
    }

    @GetMapping("/csv")
    public ResponseEntity<String> exportCsv(
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String order) {
        List<Property> rows = datasetService.query(bedrooms, minPrice, maxPrice, sort, order);
        String csv = exportService.toCsv(rows);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"properties.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
