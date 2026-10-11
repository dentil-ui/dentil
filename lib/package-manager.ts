export const packageManagers = ['pnpm', 'npm', 'yarn', 'bun'] as const;

export type PackageManager = (typeof packageManagers)[number];

export const DEFAULT_PACKAGE_MANAGER: PackageManager = 'pnpm';

export const PACKAGE_MANAGER_STORAGE_KEY = 'dentil:package-manager';

export function isPackageManager(value: unknown): value is PackageManager {
  return packageManagers.includes(value as PackageManager);
}

const runners: Record<PackageManager, string> = {
  pnpm: 'pnpm dlx',
  npm: 'npx',
  yarn: 'yarn dlx',
  bun: 'bunx --bun',
};

export function shadcnAddCommand(packageManager: PackageManager, items: string[]) {
  return `${runners[packageManager]} shadcn@latest add ${items.join(' ')}`;
}

/**
 * Runs in <head> before first paint: applies the stored choice to `<html data-pm>`, which CSS in globals.css uses to
 * show the matching command and tab before React hydrates.
 */
export const packageManagerScript = `(function(){try{var p=localStorage.getItem(${JSON.stringify(
  PACKAGE_MANAGER_STORAGE_KEY
)});if(${JSON.stringify(packageManagers)}.indexOf(p)>-1)document.documentElement.setAttribute("data-pm",p)}catch(e){}})()`;
