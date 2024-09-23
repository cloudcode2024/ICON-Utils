/**
 *  Busca columnas con cierto toda la wic
 */

// Example: /<column name='seccio'.*?\/>/g

const regex = /<column name='column'.*?\/>/g;

/* Don't touch */
const mTabdata = Ax.db.executeQuery(`
    SELECT tab_name, tab_data
      FROM wic_table_object
`);

mTabdata.forEach((mRotabdata) => {
  const tabdata = mRotabdata.tab_data;
  const match = tabdata.match(regex);

  if (!match) return;
  console.log(mRotabdata.tab_name);
});
