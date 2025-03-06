import { dirname } from 'node:path/posix';
import { CreateNodesV2 } from '@nx/devkit';

export const createNodesV2: CreateNodesV2 = [
  'packages/*/package.json',
  (packageFiles) => {
    return packageFiles.map((file) => {
      const projectPath = dirname(file);
      const [, projectName] = projectPath.split('/');
      const type = projectName.split('-').at(-1);

      return [
        file,
        {
          projects: {
            [projectPath]: {
              tags: [`type:${type}`],
              targets: {
                test: {
                  command: 'vitest --config=packages/vite.config.mts',
                },
              },
            },
          },
        },
      ];
    });
  },
];
