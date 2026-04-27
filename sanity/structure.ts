import type {StructureResolver} from 'sanity/structure'

const singletonTypes = new Set([
  'siteSettings',
  'heroSettings',
  'aboutPageSettings',
  'originalsPageSettings',
  'originalOrder',
  'commissionsPageSettings',
  'emailSettings',
])

const explicitContentTypes = new Set([
  'original',
  'originalCollection',
])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
      S.listItem()
        .title('Email Settings')
        .id('emailSettings')
        .child(
          S.document()
            .schemaType('emailSettings')
            .documentId('emailSettings')
        ),
      S.listItem()
        .title('Hero Settings')
        .id('heroSettings')
        .child(
          S.document()
            .schemaType('heroSettings')
            .documentId('heroSettings')
        ),
      S.listItem()
        .title('Originals Page Settings')
        .id('originalsPageSettings')
        .child(
          S.document()
            .schemaType('originalsPageSettings')
            .documentId('originalsPageSettings')
        ),
      S.listItem()
        .title('Originals Order')
        .id('originalOrder')
        .child(
          S.document()
            .schemaType('originalOrder')
            .documentId('originalOrder')
        ),
      S.listItem()
        .title('About Page Settings')
        .id('aboutPageSettings')
        .child(
          S.document()
            .schemaType('aboutPageSettings')
            .documentId('aboutPageSettings')
        ),
      S.listItem()
        .title('Commissions Page Settings')
        .id('commissionsPageSettings')
        .child(
          S.document()
            .schemaType('commissionsPageSettings')
            .documentId('commissionsPageSettings')
        ),
      S.divider(),
      S.listItem()
        .title('Original Artwork')
        .schemaType('original')
        .child(
          S.documentTypeList('original')
            .title('Original Artwork')
        ),
      S.listItem()
        .title('Original Collections')
        .schemaType('originalCollection')
        .child(
          S.documentTypeList('originalCollection')
            .title('Original Collections')
        ),
      S.divider(),
      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId()
        return id ? !singletonTypes.has(id) && !explicitContentTypes.has(id) : true
      }),
    ])
