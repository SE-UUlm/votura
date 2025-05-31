import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type * as OpenApiPlugin from 'docusaurus-plugin-openapi-docs';
import remarkDefList from 'remark-deflist';

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
          editUrl: 'https://github.com/SE-UUlm/votura',
          docItemComponent: '@theme/ApiItem',
          remarkPlugins: [remarkDefList],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
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
            specPath: '../backend/api/openapi.yaml',
            outputDir: 'docs/api',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
              sidebarCollapsible: true,
              sidebarCollapsed: true,
            },
            showSchemas: true,
          } satisfies OpenApiPlugin.Options,
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
          href: 'https://github.com/SE-UUlm/votura',
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
              href: 'https://github.com/SE-UUlm/votura/discussions',
            },
            {
              label: 'Issue Tracker',
              href: 'https://github.com/SE-UUlm/votura/issues',
            },
            {
              label: 'Security Issues',
              href: 'https://github.com/SE-UUlm/votura/security',
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
              href: 'https://github.com/SE-UUlm/votura',
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
  } satisfies Preset.ThemeConfig,
};

export default CONFIG;
