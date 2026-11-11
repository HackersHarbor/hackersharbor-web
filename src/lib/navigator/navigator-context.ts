import type { NavigatorPageContext } from "@/types/navigator";

const MAX_CONTEXT_LENGTH = 300;

function sanitize(value?: string): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return value.trim().slice(0, MAX_CONTEXT_LENGTH);
}

export function createNavigatorContext(
  pathname?: string,
  pageTitle?: string,
  workspace?: string,
  datasetName?: string
): NavigatorPageContext {
  return {
    pathname: sanitize(pathname),
    pageTitle: sanitize(pageTitle),
    workspace: sanitize(workspace),
    datasetName: sanitize(datasetName),
  };
}

export function getNavigatorPageName(
  pathname?: string
): string {
  if (!pathname) {
    return "HackersHarbor";
  }

  const segments = pathname
    .split("/")
    .filter(Boolean);

  if (segments.length === 0) {
    return "Home";
  }

  return segments
    .map((segment) =>
      segment
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase())
    )
    .join(" / ");
}
