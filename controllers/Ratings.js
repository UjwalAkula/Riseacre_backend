const METHOD_VERSION = '1.0';

const validDistance = (value) => value !== null && value !== undefined && !(typeof value === 'string' && value.trim() === '') && Number.isFinite(Number(value)) && Number(value) >= 0;

const bandScore = (value, bands) => {
  const distance = Number(value);
  return bands.find(({ max }) => distance <= max)?.score ?? 1;
};

const scoreBands = {
  metro: [{ max: 1, score: 5 }, { max: 3, score: 4 }, { max: 5, score: 3 }, { max: 10, score: 2 }],
  busStation: [{ max: 0.5, score: 5 }, { max: 1, score: 4 }, { max: 3, score: 3 }, { max: 5, score: 2 }],
  railwayStation: [{ max: 2, score: 5 }, { max: 5, score: 4 }, { max: 10, score: 3 }, { max: 20, score: 2 }],
  school: [{ max: 1, score: 5 }, { max: 3, score: 4 }, { max: 5, score: 3 }, { max: 10, score: 2 }],
  hospital: [{ max: 1, score: 5 }, { max: 3, score: 4 }, { max: 5, score: 3 }, { max: 10, score: 2 }],
};

const roundOneDecimal = (value) => Math.round(value * 10) / 10;

/**
 * Riseacre Location Convenience Index v1.0.
 * Distances are supplied by the listing author and have not been independently verified.
 * Three transit factors and at least one daily-needs factor are required to publish a score.
 * Airport distance is deliberately excluded from the daily convenience calculation.
 */
const calculateLocationConvenience = (connectivity) => {
  const fields = ['metro', 'busStation', 'railwayStation', 'school', 'hospital'];
  const transitFields = ['metro', 'busStation', 'railwayStation'];
  const serviceFields = ['school', 'hospital'];
  const transitCoverage = transitFields.filter((field) => validDistance(connectivity?.[field])).length * 20;
  const serviceCoverage = serviceFields.filter((field) => validDistance(connectivity?.[field])).length * 20;
  const coveragePercent = transitCoverage + serviceCoverage;
  const breakdown = Object.fromEntries(fields.map((field) => [
    field,
    validDistance(connectivity?.[field]) ? bandScore(connectivity[field], scoreBands[field]) : null,
  ]));
  const transitComplete = transitFields.every((field) => breakdown[field] !== null);
  const dailyNeedsPresent = serviceFields.some((field) => breakdown[field] !== null);

  if (!transitComplete || !dailyNeedsPresent) {
    return {
      score: null,
      coveragePercent,
      methodVersion: METHOD_VERSION,
      breakdown,
    };
  }

  const transitScore = transitFields.reduce((sum, field) => sum + breakdown[field], 0) / transitFields.length;
  const dailyNeedsScores = serviceFields.filter((field) => breakdown[field] !== null).map((field) => breakdown[field]);
  const dailyNeedsScore = dailyNeedsScores.reduce((sum, value) => sum + value, 0) / dailyNeedsScores.length;
  const score = roundOneDecimal((transitScore * 0.6) + (dailyNeedsScore * 0.4));
  return {
    score,
    coveragePercent,
    methodVersion: METHOD_VERSION,
    breakdown,
  };
};

module.exports = { calculateLocationConvenience, METHOD_VERSION };
