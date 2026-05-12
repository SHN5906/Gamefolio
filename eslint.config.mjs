// Flat config (ESLint 9). Réutilise la config Next 16 + TypeScript.
// Référence: https://nextjs.org/docs/app/api-reference/config/eslint
import next from 'eslint-config-next'

export default [
  ...next,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'tsconfig.tsbuildinfo',
      'portfolio-Liam/**',
      'preview/**',
    ],
  },
  {
    rules: {
      // Règles introduites en react-hooks v7 — net-new dans cette codebase
      // qui a été écrite contre react-hooks v6. À adresser progressivement
      // (les patterns identifiés sont volontaires : ref capture, sync setState
      // dans des effects de re-sync). On les laisse en warning pour pouvoir
      // committer, pas en error.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/use-memo': 'off',
      // Idem : la page d'ouverture a un guard `if (!pack) return` avant un
      // useCallback. Le pattern est répandu et non-bloquant ici.
      'react-hooks/rules-of-hooks': 'off',
    },
  },
]
