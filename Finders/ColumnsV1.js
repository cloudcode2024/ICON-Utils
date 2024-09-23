/**
 *  Busca primary key con cierto nombre en toda la wic
 */

// Example: /<primary name='codigo' columns='(.*?)' \/>/
const regex = /<primary name='.*?' columns='(.*?)' \/>/;

/* Don't touch */
const mTabdata = Ax.db.executeQuery(`
    SELECT tab_name, tab_data
      FROM wic_table_object
`);

mTabdata.forEach((mRotabdata) => {
  const tabdata = mRotabdata.tab_data;
  const match = tabdata.match(regex);

  if (!match) return;

  const column = match[0];
  console.log("El texto después de 'columns' es:", column);
});
