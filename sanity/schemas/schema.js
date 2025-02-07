import artProduct from './artProduct';

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([artProduct]),
});
