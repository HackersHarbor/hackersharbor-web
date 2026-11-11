import { dataQualityEngine } from "./DataQualityEngine";

import { allowedValuesDetector } from "./detectors/AllowedValuesDetector";
import { columnStructureDetector } from "./detectors/ColumnStructureDetector";
import { categoryConsistencyDetector } from "./detectors/CategoryConsistencyDetector";
import { crossColumnConsistencyDetector } from "./detectors/CrossColumnConsistencyDetector";
import { dateTimeDetector } from "./detectors/DateTimeDetector";
import { distributionDriftDetector } from "./detectors/DistributionDriftDetector";
import { duplicateDetector } from "./detectors/DuplicateDetector";
import { foreignKeyDetector } from "./detectors/ForeignKeyDetector";
import { missingValueDetector } from "./detectors/MissingValueDetector";
import { outlierDetector } from "./detectors/OutlierDetector";
import { placeholderDetector } from "./detectors/PlaceholderDetector";
import { rangeDetector } from "./detectors/RangeDetector";
import { ruleEvaluator } from "./rules/RuleEvaluator";
import { referentialIntegrityDetector } from "./detectors/ReferentialIntegrityDetector";
import { regexPatternDetector } from "./detectors/RegexPatternDetector";
import { schemaDetector } from "./detectors/SchemaDetector";
import { typeMismatchDetector } from "./detectors/TypeMismatchDetector";
import { temporalDetector } from "./detectors/TemporalDetector";
import { uniquenessDetector } from "./detectors/UniquenessDetector";
import { whitespaceDetector } from "./detectors/WhitespaceDetector";

/**
 * Registers the built-in detectors exactly once per engine instance.
 * Call this during engine initialization, before the first scan.
 */
export function registerDefaultDetectors(): void {
  const registeredIds = new Set(
    dataQualityEngine.listDetectors().map((detector) => detector.id),
  );

  const defaults = [
    allowedValuesDetector,
    columnStructureDetector,
    categoryConsistencyDetector,
    crossColumnConsistencyDetector,
    dateTimeDetector,
    distributionDriftDetector,
    duplicateDetector,
    foreignKeyDetector,
    missingValueDetector,
    outlierDetector,
    placeholderDetector,
    rangeDetector,
    ruleEvaluator,
    referentialIntegrityDetector,
    regexPatternDetector,
    schemaDetector,
    typeMismatchDetector,
    temporalDetector,
    uniquenessDetector,
    whitespaceDetector,
  ];

  dataQualityEngine.registerMany(
    defaults.filter((detector) => !registeredIds.has(detector.id)),
  );
}
