/**
 *  Busca nombre de tablas apartir de datos del Foreign key en toda la wic
 */

/* Example /<foreign name='.*?' columns='.*?' references='cproyect' refcols='codigo' \/>/g*/
const regex =
  /<foreign name='.*?' columns='.*?' references='tabla' refcols='columna' \/>/g;

/* Don't touch */
const mTabdata = Ax.db.executeQuery(`
    SELECT tab_name, tab_data  FROM wic_table_object
`);

mTabdata.forEach((mRotabdata) => {
  const tabdata = mRotabdata.tab_data;
  const match = tabdata.match(regex);

  if (!match) return;

  const column = match[0];
  console.log(mRotabdata.tab_name);
});
