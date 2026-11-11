import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
} from "../types";

interface CategoryVariant {
  value: string;
  rowIndexes: number[];
}

interface CategoryGroup {
  normalized: string;
  variants: Map<string, CategoryVariant>;
  matchKind: "case-whitespace" | "separator" | "boolean-alias";
}

const BOOLEAN_CATEGORY_GROUPS: Record<string, string> = {
  yes: "boolean:true",
  y: "boolean:true",
  true: "boolean:true",
  t: "boolean:true",
  "1": "boolean:true",
  no: "boolean:false",
  n: "boolean:false",
  false: "boolean:false",
  f: "boolean:false",
  "0": "boolean:false",
};

function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeWithoutSeparators(value: string): string {
  return normalizeText(value).replace(/[\s_-]+/g, "");
}

function describeVariant(value: string): string {
  return JSON.stringify(value);
}

function getCategoryKey(
  value: string,
): { key: string; matchKind: CategoryGroup["matchKind"] } {
  const normalized = normalizeText(value);
  const booleanKey = BOOLEAN_CATEGORY_GROUPS[normalized];

  if (booleanKey) {
    return { key: booleanKey, matchKind: "boolean-alias" };
  }

  const compact = normalizeWithoutSeparators(value);
  if (compact !== normalized.replace(/\s+/g, "")) {
    return { key: `separator:${compact}`, matchKind: "separator" };
  }

  return { key: `text:${normalized}`, matchKind: "case-whitespace" };
}

export class CategoryConsistencyDetector implements DataQualityDetector {
  readonly id = "category-consistency";
  readonly name = "Category Consistency Detector";
  readonly description =
    "Finds category values that differ only by case, whitespace, common separators, or common boolean representations.";
  readonly dimension = "consistency" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, signal } = context;
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];
    let cancelled = false;

    for (const column of columns) {
      if (signal?.aborted) {
        cancelled = true;
        break;
      }

      const groups = new Map<string, CategoryGroup>();

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        if (signal?.aborted) {
          cancelled = true;
          break;
        }

        const value = rows[rowIndex]?.[column];

        // Missing values and non-string values are handled by other checks.
        if (typeof value !== "string" || value.trim() === "") {
          continue;
        }

        const { key, matchKind } = getCategoryKey(value);
        if (!key || key === "text:") continue;

        let group = groups.get(key);

        if (!group) {
          group = {
            normalized: key,
            variants: new Map<string, CategoryVariant>(),
            matchKind,
          };
          groups.set(key, group);
        }

        let variant = group.variants.get(value);

        if (!variant) {
          variant = { value, rowIndexes: [] };
          group.variants.set(value, variant);
        }

        variant.rowIndexes.push(rowIndex);
      }

      if (cancelled) break;

      for (const group of groups.values()) {
        const variants = [...group.variants.values()];

        if (variants.length < 2) continue;

        const affectedRows = [
          ...new Set(variants.flatMap((variant) => variant.rowIndexes)),
        ].sort((a, b) => a - b);

        const variantDescriptions = variants.map((variant) => ({
          value: variant.value,
          count: variant.rowIndexes.length,
        }));

        const trimmedValues = variants.map((variant) => variant.value.trim());
        const caseWhitespaceOnly = trimmedValues.every(
          (value) => normalizeText(value) === normalizeText(trimmedValues[0]),
        );

        const title =
          group.matchKind === "boolean-alias"
            ? `Inconsistent boolean-like categories in "${column}"`
            : caseWhitespaceOnly
              ? `Inconsistent category formatting in "${column}"`
              : `Potential category variants in "${column}"`;

        let description: string;

        if (group.matchKind === "boolean-alias") {
          description =
            "Values use different common representations of the same boolean-like category. Confirm that this column is intended to represent a true/false concept before standardizing.";
        } else if (caseWhitespaceOnly) {
          description =
            "Values differ only in capitalization, Unicode presentation, or surrounding whitespace.";
        } else {
          description =
            "Values differ by spacing or common separators. They may represent the same category, but this detector cannot confirm that they have the same meaning.";
        }

        const examples = variants.slice(0, 5).map((variant) => ({
          rowIndex: variant.rowIndexes[0],
          column,
          before: variant.value,
          after: variant.value.trim(),
          reason: `Observed ${variant.rowIndexes.length} occurrence(s) of this variant.`,
        }));

        const issueKey = encodeURIComponent(`${column}|${group.normalized}`);

        issues.push({
          id: `category-variant-${issueKey}`,
          detectorId: this.id,
          title,
          description,
          dimension: "consistency",
          severity: "warning",
          status: "needs-review",
          columns: [column],
          rowIndexes: affectedRows,
          affectedCount: affectedRows.length,
          affectedCountUnit: "rows",
          evidence: [
            `Found ${variants.length} distinct raw variants.`,
            `Match pattern: ${group.matchKind}.`,
            ...variantDescriptions.map(
              (variant) =>
                `${describeVariant(variant.value)}: ${variant.count} occurrence(s)`,
            ),
          ],
          examples,
          actions: [
            {
              id: `review-category-variants-${issueKey}`,
              label: "Review category variants",
              kind: "review-rows",
              risk: "safe",
              enabled: true,
              description:
                "Review the original values and their context before deciding whether they represent the same category.",
            },
            {
              id: `standardize-category-${issueKey}`,
              label: "Standardize category values",
              kind: "standardize-category",
              risk: "review",
              enabled: true,
              description:
                "Choose an explicit mapping after confirming that the variants have the same meaning.",
            },
          ],
          metadata: {
            normalizedCategory: group.normalized,
            matchKind: group.matchKind,
            variants: variantDescriptions,
            formattingOnly: caseWhitespaceOnly,
            requiresSemanticConfirmation: group.matchKind !== "case-whitespace",
          },
          detectedAt: Date.now(),
        });
      }
    }

    if (cancelled) {
      warnings.push(
        "Category consistency scan stopped because cancellation was requested.",
      );
    }

    return {
      detectorId: this.id,
      issues,
      scannedRows: rows.length,
      scannedColumns: columns.length,
      durationMs: Math.max(0, Date.now() - startedAt),
      warnings,
    };
  }
}

export const categoryConsistencyDetector = new CategoryConsistencyDetector();
