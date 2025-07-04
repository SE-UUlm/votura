import type {
  Options as PresetOptions,
  ThemeConfig as PresetThemeConfig,
} from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import type { Options as OpenApiPluginOptions } from 'docusaurus-plugin-openapi-docs';
import { themes as prismThemes } from 'prism-react-renderer';
import remarkDefList from 'remark-deflist';

const GITHUB_URL = 'https://github.com/SE-UUlm/votura';

const CONFIG: Config = {
  title: 'votura',
  tagline: 'Setup online votes and polls in that your users trust!',
  favicon: 'img/logo.svg',
  url: 'https://SE-UUlm.github.io',
  baseUrl: '/votura/',
  organizationName: 'SE-UUlm',
  projectName: 'votura',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: GITHUB_URL,
          docItemComponent: '@theme/ApiItem',
          remarkPlugins: [remarkDefList],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies PresetOptions,
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'api',
        docsPluginId: 'classic',
        config: {
          backend: {
            specPath: '../../packages/votura-validators/generated/voturaApiSchema.json',
            outputDir: 'docs/api',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
              sidebarCollapsible: true,
              sidebarCollapsed: true,
            },
            showSchemas: true,
          } satisfies OpenApiPluginOptions,
        },
      },
    ],
  ],

  markdown: {
    mermaid: true,
  },

  themes: ['docusaurus-theme-openapi-docs', '@docusaurus/theme-mermaid'],

  themeConfig: {
    mermaid: {
      theme: { light: 'neutral', dark: 'forest' },
    },
    image: 'img/votura_logo_3l.svg',
    navbar: {
      //title: 'votura',
      logo: {
        alt: 'The votura logo, a blue box with ballot paper.',
        src: 'img/logo_1l.svg',
        srcDark: 'img/logo_1l_w.svg',
      },
      items: [
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          type: 'docSidebar',
          sidebarId: 'userGuideSidebar',
          position: 'left',
          label: 'User Guide',
        },
        {
          type: 'docSidebar',
          sidebarId: 'devGuideSidebar',
          position: 'left',
          label: 'Developer Guide',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API',
        },
        {
          type: 'docSidebar',
          sidebarId: 'aboutSidebar',
          position: 'left',
          label: 'About',
        },
        {
          href: GITHUB_URL,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'User Guide',
              to: '/docs/userGuide/',
            },
            {
              label: 'Developer Guide',
              to: '/docs/devGuide/',
            },
          ],
        },
        {
          title: 'Support',
          items: [
            {
              label: 'Community Support',
              href: `${GITHUB_URL}/discussions`,
            },
            {
              label: 'Issue Tracker',
              href: `${GITHUB_URL}/issues`,
            },
            {
              label: 'Security Issues',
              href: `${GITHUB_URL}/security`,
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'About',
              to: '/docs/about/',
            },
            {
              label: 'Imprint',
              href: 'https://www.uni-ulm.de/misc/datenschutz/datenschutz/impressum/',
            },
            {
              label: 'GitHub',
              href: GITHUB_URL,
            },
            {
              label: 'University of Ulm',
              href: 'https://www.uni-ulm.de',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} votura`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies PresetThemeConfig,
};

export default CONFIG;
