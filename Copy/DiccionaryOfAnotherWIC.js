/**
 *  Copia el dicionario logico y las columnas de otra wic
 */

const WIC_ORIGEN = "wic_icon_int";
const WIC_DESTINO = "wic_icon";
const TABLA_ORIGE = "pe_cinmelem_ppe";
const TABLA_DESTI = "cinmelem_dat"; //Nombre a insertar en la wic de destino

/* Don't touch */
const CONEXION_ORIGEN = Ax.db.of(WIC_ORIGEN);
const CONEXION_DESTIN = Ax.db.of(WIC_DESTINO);
const USER_CODE = Ax.ext.user.getCode();
const CURRENT_TIME = new Ax.sql.Date();

const tabledata = CONEXION_ORIGEN.executeQuery(
  `SELECT * 
     FROM wic_jdic_tabdata 
    WHERE tab_name = '${TABLA_ORIGE}'`
).toJSONArray();

function changeData(data) {
  if (!data) throw `Datos vacios`;

  data.user_created = USER_CODE;
  data.date_created = CURRENT_TIME;
  data.user_updated = USER_CODE;
  data.date_updated = CURRENT_TIME;
  data.tab_name     = TABLA_DESTI;

  if (data.col_id) data.col_id = 0;
  if (data.tab_id) data.tab_id = 0;

  return data;
}

try {
  /** Logic table */
  CONEXION_DESTIN.insert("wic_jdic_tabdata", tabledata.map((element) => changeData(element)));
  console.log(`Tablas insertadas: ${TABLA_ORIGE} --> ${TABLA_DESTI} a ${WIC_DESTINO}`);

  /** Columns */
  try {
    const mcolumns = CONEXION_ORIGEN.executeQuery(`SELECT * FROM wic_jdic_coldata WHERE tab_name = '${TABLA_ORIGE}'`).toJSONArray();
    CONEXION_DESTIN.insert("wic_jdic_coldata", mcolumns.map((element) => changeData(element)));
    console.log(`TColumnas insertadas a la tabla ${TABLA_DESTI} de${WIC_DESTINO}`);

  } catch (error) {
    console.log(`Error insertando columnas ${TABLA_ORIGE} --> ${TABLA_DESTI} a ${WIC_DESTINO}: ${error}`);
  }
  
} catch (error) {
  console.log(`Error insertando tabla ${TABLA_ORIGE} --> ${TABLA_DESTI} a ${WIC_DESTINO}: ${error}`);
}
