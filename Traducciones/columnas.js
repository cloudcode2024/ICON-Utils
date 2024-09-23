/**
 *  Traduce todas las columnas logicas al array de idiomas definidos
 */
const ARRNEWLAN = ["en", "ca", "pt", "fr", "it", "de"];

/** Don't touch */
const USER_CODE = Ax.ext.user.getCode();
const DATE_CURRENT = new Ax.util.Date();

function translate(data) {
  try {
    return Ax.ext.google.translate.translateText("es", NEWLANG, data) ?? "";
  } catch (err) {
    return "";
  }
}

ARRNEWLAN.forEach((NEWLANG) => {
  console.log(`-----------------${NEWLANG}-----------------`);
  
  let mRsDetalle = Ax.db.executeQuery(`
        SELECT '${NEWLANG}' locale_tar, col_id, locale, tab_name, col_name, col_memo, col_desc, col_info,
    		  CASE WHEN (SELECT COUNT(*) FROM wic_obj_table WHERE wic_obj_table.tabname = wic_jdic_coldata.tab_name) > 0 THEN 1 ELSE 0 END has_wic_obj_table
          FROM wic_jdic_coldata
         WHERE locale = 'es' 
           AND NOT EXISTS (SELECT col_id 
                            FROM wic_jdic_coldata t 
                           WHERE t.tab_name = wic_jdic_coldata.tab_name 
                             AND t.col_name = wic_jdic_coldata.col_name 
                             AND t.locale= '${NEWLANG}')
        ORDER BY 4
    `);

  mRsDetalle.forEach((data) => {
    try {
      Ax.db.beginWork();

      if (!data.col_memo) return;

      let memo_translate = translate(data.col_memo).toString();
      data.col_memo = memo_translate[0].toUpperCase() + memo_translate.slice(1);

      if (data.col_desc) {
        let desc_translate = translate(data.col_desc);
        data.col_desc = desc_translate
          ? desc_translate[0].toUpperCase() + desc_translate.slice(1)
          : data.col_desc;
      }

      if (data.col_info) {
        let info_translate = translate(data.col_info);
        data.col_info = info_translate
          ? info_translate[0].toUpperCase() + info_translate.slice(1)
          : data.col_info;
      }

      Ax.db.insert("wic_jdic_coldata", {
        col_id: 0,
        locale: NEWLANG,
        audited: 0,
        tab_name: data.tab_name,
        col_name: data.col_name,
        col_memo: data.col_memo,
        col_desc: data.col_desc,
        col_info: data.col_info,
        user_created: USER_CODE,
        user_updated: USER_CODE,
        date_created: DATE_CURRENT,
        date_updated: DATE_CURRENT,
      });

      Ax.db.commitWork();
      console.log("Successfull translating:", data.col_memo);
    } catch (err) {
      console.log("Error translating:", err);
      Ax.db.rollbackWork();
    }
  });
});
