# Plugin Landing Template (docsjs Ecosystem)

## Goal

Use one shared information architecture for all docsjs plugin landing pages.

- Keep page structure consistent with `docsjs.coding01.cn`
- Allow each plugin to keep its own visual theme (colors, fonts, textures)
- Keep copy versionless (do not hardcode package versions)

## Canonical Section Order

1. `nav`
2. `hero`
3. `features`
4. `showcase`
5. `api-section`
6. `release`
7. `sponsors` (ecosystem / cross-promo)
8. `footer`

## Required Navigation Links

- `#features`
- `#showcase`
- `#api`
- plugin GitHub repository

## Hero Requirements

- One sentence value proposition
- Primary CTA: npm package page
- Secondary CTA: related core plugin/product page (for cross-traffic)
- Third CTA: anchor to showcase case section
- 4 compact stats (entry count / runtime / extensibility / output type)

## Feature Card Requirements

At least 4 cards:

- Architecture capability (entry split)
- Extensibility capability (rules/plugins)
- Delivery capability (CLI/CI/pipeline)
- Ecosystem capability (recommended pairing)

## Showcase Requirements

Must include both parts:

- API usage code block
- Side-by-side case panel:
  - Left: source docs content (usually docsjs HTML snapshot)
  - Right: parsed target content (markdown/result)

## API Section Requirements

At least 3 cards:

- Main API entry
- Secondary/sub entry
- CLI/automation command

## Release Section Requirements

Exactly 3 cards:

- CI quality gate trigger
- npm publish trigger
- Pages deploy trigger

## Ecosystem Section Requirements

- Explain this page belongs to docsjs plugin family
- Include cross-promo badges/chips to sibling plugins
- No version pinning in recommendation copy

## Footer Requirements

- GitHub link
- npm link
- docsjs core site link
- license copy

## i18n Contract

Landing pages must support `en` and `zh`, with one shared key set.

Required keys:

- `heroTitle`
- `heroLead`
- `ctaNpm`
- `ctaDocsjs`
- `ctaDemo`
- `statEntries`
- `statCli`
- `statRules`
- `statOut`
- `featuresTitle`
- `f1Title`
- `f1Desc`
- `f2Title`
- `f2Desc`
- `f3Title`
- `f3Desc`
- `f4Title`
- `f4Desc`
- `showcaseTitle`
- `leftTitle`
- `rightTitle`
- `apiTitle`
- `apiMain`
- `apiDocx`
- `apiCli`
- `releaseTitle`
- `r1`
- `r2`
- `r3`
- `ecoTitle`
- `ecoDesc`

## Theme Policy

Allowed to change:

- colors
- typography
- gradients/background texture
- card style and spacing

Must stay stable:

- section order
- semantic anchors (`#features`, `#showcase`, `#api`)
- i18n key contract
- cross-promo block

## Suggested File Layout

- `docs/index.html`: concrete page
- `docs/LANDING_TEMPLATE.md`: architecture and rules

## QA Checklist

- [ ] Desktop and mobile both readable
- [ ] Language switch (`EN/中文`) works for all text keys
- [ ] In-page nav smooth scroll works for anchor links
- [ ] Cross-promo links open correct target pages
- [ ] No hardcoded version string in recommendation copy
- [ ] Pages workflow still deploys from `docs/**` updates
