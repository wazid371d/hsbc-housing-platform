package com.hsbc.market;

import com.hsbc.market.model.Property;
import com.hsbc.market.service.DatasetService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class DatasetServiceTest {

    @Autowired
    DatasetService datasetService;

    @Test
    void findAllReturnsWholeDataset() {
        assertThat(datasetService.findAll()).hasSize(50);
    }

    @Test
    void queryFiltersByBedroomsAndSortsByPriceDesc() {
        List<Property> rows = datasetService.query(3, null, null, "price", "desc");

        assertThat(rows).isNotEmpty();
        assertThat(rows).allMatch(p -> p.bedrooms() == 3);

        // Prices must be in non-increasing order.
        for (int i = 1; i < rows.size(); i++) {
            assertThat(rows.get(i - 1).price()).isGreaterThanOrEqualTo(rows.get(i).price());
        }
    }
}
