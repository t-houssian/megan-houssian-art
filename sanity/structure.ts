import type {StructureResolver} from 'sanity/structure'

const singletonTypes = new Set(['heroSettings', 'aboutPageSettings', 'originalsPageSettings'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
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
        .title('About Page Settings')
        .id('aboutPageSettings')
        .child(
          S.document()
            .schemaType('aboutPageSettings')
            .documentId('aboutPageSettings')
        ),
      S.divider(),
      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId()
        return id ? !singletonTypes.has(id) : true
      }),
    ])
