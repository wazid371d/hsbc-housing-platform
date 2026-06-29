package com.hsbc.market.service;

import com.hsbc.market.model.WhatIfRequest;
import com.hsbc.market.model.WhatIfResponse;
import com.hsbc.market.service.MlClientService.MlPrediction;
import org.springframework.stereotype.Service;

/** Runs a what-if prediction and compares it to the relevant market segment. */
@Service
public class WhatIfService {

    private final MlClientService mlClient;
    private final StatsService statsService;

    public WhatIfService(MlClientService mlClient, StatsService statsService) {
        this.mlClient = mlClient;
        this.statsService = statsService;
    }

    public WhatIfResponse analyze(WhatIfRequest request) {
        MlPrediction prediction = mlClient.predict(request);
        double segmentAvg = statsService.avgPriceForBedrooms(request.bedrooms());
        return new WhatIfResponse(
                prediction.predicted_price(),
                prediction.lower_bound(),
                prediction.upper_bound(),
                prediction.out_of_range(),
                request.bedrooms() + " bd",
                round(segmentAvg),
                round(prediction.predicted_price() - segmentAvg)
        );
    }

    private static double round(double v) {
        return Math.round(v * 100) / 100.0;
    }
}
