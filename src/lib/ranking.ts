
import type { Species, CastingConditions, LureFamily, RankedSpot, RankingOutput, ScoreStatus, SpotKey } from './types';

const SPOT_DEFINITIONS: Record<SpotKey, { label: string }> = {
    windward_bank: { label: "Windward Bank" },
    windward_point: { label: "Windward Point" },
    shade_cover: { label: "Shade/Cover" },
    flats_weeds: { label: "Flats/Weeds" },
    inflow_creek: { label: "Inflow/Creek" },
    transition_line: { label: "Transition Line" },
    current_seam: { label: "Current Seam" },
    behind_structure: { label: "Lee of Structure" },
    drop_off: { label: "Drop-off" },
    thermocline: { label: "Deeper Break" },
};

const getStatusFromScore = (score: number): ScoreStatus => {
    if (score >= 95) return "Prime";
    if (score >= 80) return "Very Good";
    if (score >= 67) return "Good";
    if (score >= 55) return "Fair";
    if (score >= 45) return "Fair-Slow";
    if (score >= 30) return "Poor";
    return "Very Poor";
};

// Simplified lure recommendation logic
const getLurePick = (spot: SpotKey, conditions: CastingConditions, species: "bream" | "bass" | "carp"): LureFamily => {
    const isWindy = conditions.windKph > 10;
    const isCloudy = conditions.cloudPct > 60;
    const isBreamOrCarp = species === 'bream' || species === 'carp';

    switch (spot) {
        case 'windward_bank':
        case 'windward_point':
            return isBreamOrCarp ? 'Soft' : 'Crank/Swim';
        case 'shade_cover':
            return isBreamOrCarp ? 'Live' : 'Soft';
        case 'flats_weeds':
            return isCloudy ? 'Spinner' : 'Crank/Swim';
        case 'inflow_creek':
        case 'transition_line':
            return isBreamOrCarp ? 'Live' : 'Crank/Swim';
        case 'current_seam':
            return isBreamOrCarp ? 'Live' : 'Soft';
        case 'drop_off':
        case 'thermocline':
            return isWindy ? 'Crank/Swim' : 'Soft';
        default:
            return 'Soft';
    }
};

export function rankCastingSpots({ speciesKey, conditions }: { speciesKey: "bream" | "bass" | "carp", conditions: CastingConditions }): RankingOutput {
    let scores: Record<SpotKey, number> = {
        windward_bank: 50, windward_point: 50, shade_cover: 50, flats_weeds: 50,
        inflow_creek: 50, transition_line: 50, current_seam: 50, behind_structure: 50,
        drop_off: 50, thermocline: 50,
    };

    // Wind
    if (conditions.windKph >= 6 && conditions.windKph <= 20) {
        scores.windward_bank += 20;
        scores.windward_point += 18;
        scores.transition_line += 10;
    }
    if (conditions.windKph > 20) {
        scores.behind_structure += 14;
        if (conditions.body === 'river') scores.current_seam += 10;
        scores.flats_weeds -= 10;
    }
    if (conditions.windKph < 6) {
        scores.windward_bank -= 6;
        scores.windward_point -= 6;
    }

    // Light / Cloud
    if (conditions.cloudPct >= 60) {
        scores.flats_weeds += 14;
        scores.windward_bank += 8;
        scores.shade_cover -= 10;
    }
    if (conditions.cloudPct <= 30) {
        scores.shade_cover += 18;
        scores.drop_off += 8;
        scores.flats_weeds -= 8;
    }

    // Pressure
    if (conditions.pressureTrendHpaPer3h <= -1.0) {
        scores.windward_point += 16;
        scores.windward_bank += 16;
        scores.transition_line += 10;
    }
    if (conditions.pressureTrendHpaPer3h >= 1.0) {
        scores.shade_cover += 14;
        scores.thermocline += 14;
        scores.windward_bank -= 8;
        scores.windward_point -= 8;
    }
    
    // Rain
    if (conditions.rainMm24h > 0.1 && conditions.rainMm24h <= 8) {
        scores.inflow_creek += 20;
        scores.transition_line += 14;
    }

    // Water Level
    if (conditions.waterLevel === 'rising') scores.shade_cover += 16; // Simplified to 'shade/cover'
    if (conditions.waterLevel === 'falling') {
        scores.drop_off += 16;
        scores.flats_weeds -= 8;
    }

    // Body Type
    if (conditions.body === 'river') {
        scores.current_seam += 18;
        // Apply wind penalty reduction (not explicitly coded, but implied in score boosts)
    }

    // Season / Time
    if (conditions.season === 'hot' && conditions.daypart === 'midday') {
        scores.thermocline += 14;
        if (conditions.body === 'river') scores.current_seam += 14;
        scores.shade_cover += 10;
    }

    // Stability
    if (conditions.stability72h === 'low') { // Very stable
        scores.flats_weeds += 8;
        scores.drop_off += 8;
        scores.transition_line -= 6;
    }
    if (conditions.stability72h === 'high') { // Very unstable
        scores.windward_bank += 8;
        scores.inflow_creek += 8;
    }

    // Clamp scores
    Object.keys(scores).forEach(key => {
        scores[key as SpotKey] = Math.max(0, Math.min(100, Math.round(scores[key as SpotKey])));
    });

    const rankedSpots: RankedSpot[] = Object.entries(scores)
        .map(([spotKey, score]) => ({
            spotKey: spotKey as SpotKey,
            label: SPOT_DEFINITIONS[spotKey as SpotKey].label,
            score,
            band: getStatusFromScore(score),
            primaryLure: getLurePick(spotKey as SpotKey, conditions, speciesKey),
            reasons: [], // Placeholder for future implementation
        }))
        .sort((a, b) => b.score - a.score);

    const topPicks = rankedSpots;
    const confidenceScore = Math.round(topPicks.slice(0, 3).reduce((sum, s) => sum + s.score, 0) / 3);
    const topPick = {
        spotKey: topPicks[0].spotKey,
        label: topPicks[0].label,
        primaryLure: topPicks[0].primaryLure,
        band: topPicks[0].band,
    };

    return { topPicks, confidenceScore, topPick: topPick as any };
}
