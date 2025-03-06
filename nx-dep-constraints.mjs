const type = {
  app: 'type:app',
  core: 'type:core',
  domain: 'type:domain',
  feature: 'type:feature',
  infra: 'type:infra',
  ui: 'type:ui',
  util: 'type:util',
};

const commonAllowedExternalImports = ['rxjs', 'vitest'];

/**
 * @type {import('@nx/eslint-plugin/src/rules/enforce-module-boundaries').DepConstraint[]}
 */
export default [
  /**
   * Type boundaries.
   */
  {
    sourceTag: type.app,
    onlyDependOnLibsWithTags: [
      type.core,
      type.domain,
      type.feature,
      type.infra,
      type.ui,
      type.util,
    ],
    allowedExternalImports: [
      ...commonAllowedExternalImports,
      '@jscutlery/operators',
      '@nx/devkit',
      '@nx/playwright/*',
      '@playwright/test',
      '@testing-library/dom',
      '@testing-library/user-event',
      'dotenv',
      'rxjs',
      'rxjs/fetch',
    ],
  },
  {
    sourceTag: type.feature,
    onlyDependOnLibsWithTags: [
      type.core,
      type.domain,
      type.infra,
      type.ui,
      type.util,
    ],
    allowedExternalImports: [...commonAllowedExternalImports],
  },
  {
    sourceTag: type.ui,
    onlyDependOnLibsWithTags: [type.core, type.ui, type.util],
    allowedExternalImports: [...commonAllowedExternalImports],
  },
  {
    sourceTag: type.domain,
    onlyDependOnLibsWithTags: [type.core, type.domain, type.infra, type.util],
    allowedExternalImports: [...commonAllowedExternalImports],
  },
  {
    sourceTag: type.infra,
    onlyDependOnLibsWithTags: [type.core, type.infra, type.util],
    allowedExternalImports: [...commonAllowedExternalImports, 'rxjs/fetch'],
  },
  {
    sourceTag: type.core,
    onlyDependOnLibsWithTags: [type.core, type.util],
    allowedExternalImports: [...commonAllowedExternalImports],
  },
  {
    sourceTag: type.util,
    onlyDependOnLibsWithTags: [type.util],
    allowedExternalImports: [...commonAllowedExternalImports],
  },
];
