#!/usr/bin/env node
/**
 * Imprime variáveis de ambiente para o build Docusaurus a partir de repos.config.json.
 * Uso no CI: eval $(node scripts/ci-env.mjs)
 */
import {loadReposConfig, siteSlug} from './lib/load-repos-config.mjs';

const config = loadReposConfig();

const vars = {
  DOCUSAURUS_SITE_REPO: siteSlug(config.site),
  DOCUSAURUS_PROJECT_NAME: config.site.name,
  DOCUSAURUS_BASE_URL: config.site.baseUrl,
  DOCUSAURUS_PAGES_HOST: config.site.pagesHost,
};

for (const [key, value] of Object.entries(vars)) {
  console.log(`${key}=${value}`);
}
