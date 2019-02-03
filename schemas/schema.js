import createSchema from 'part:@sanity/base/schema-creator'
import schemaTypes from 'all:part:@sanity/base/schema-type'
import calendar from './calendar'

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([
    calendar
  ])
})
