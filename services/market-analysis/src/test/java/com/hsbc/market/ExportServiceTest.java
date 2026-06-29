package com.hsbc.market;

import com.hsbc.market.model.Property;
import com.hsbc.market.service.ExportService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** Plain unit test (no Spring context) for the CSV export formatting. */
class ExportServiceTest {

    private final ExportService exportService = new ExportService();

    @Test
    void csvHasHeaderAndRow() {
        Property p = new Property(1, 1500, 3, 2, 2000, 6000, 4.0, 7.0, 250000);
        String csv = exportService.toCsv(List.of(p));
        String[] lines = csv.strip().split("\n");

        assertThat(lines).hasSize(2);
        assertThat(lines[0]).startsWith("id,square_footage,bedrooms,bathrooms,year_built");
        assertThat(lines[1]).startsWith("1,1500,3,2,2000,6000,4,7,250000");
    }

    @Test
    void wholeNumbersRenderWithoutTrailingDecimal() {
        // price/sqft = 300000 / 2000 = 150.0 (whole), and every other field is whole too.
        Property p = new Property(2, 2000, 4, 3, 2010, 8000, 5.0, 8.0, 300000);
        String csv = exportService.toCsv(List.of(p));

        assertThat(csv).doesNotContain(".0");
        String row = csv.strip().split("\n")[1];
        assertThat(row).isEqualTo("2,2000,4,3,2010,8000,5,8,300000,150");
    }
}
