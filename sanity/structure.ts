import type {StructureResolver} from 'sanity/structure'

const singletonTypes = new Set(['heroSettings', 'originalsPageSettings'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Hero + About Photos')
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
      S.divider(),
      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId()
        return id ? !singletonTypes.has(id) : true
      }),
    ])
