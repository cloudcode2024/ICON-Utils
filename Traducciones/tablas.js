/**
 *  Traduce todos las tablas logicas al array de idiomas definidos
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
        SELECT 
            '${NEWLANG}' locale_tar, tab_id, locale, tab_name, tab_memo, tab_desc, tab_info
      FROM wic_jdic_tabdata
     WHERE wic_jdic_tabdata.locale = 'es' AND
            NOT EXISTS (SELECT tab_id 
                          FROM wic_jdic_tabdata t 
                         WHERE t.tab_name = wic_jdic_tabdata.tab_name AND t.locale = '${NEWLANG}')
    `);

  mRsDetalle.forEach((data) => {
    try {
      Ax.db.beginWork();

      if (!data.tab_memo) return;

      let memo_translate = translate(data.tab_memo).toString();
      data.tab_memo = memo_translate[0].toUpperCase() + memo_translate.slice(1);

      if (data.col_desc) {
        let desc_translate = translate(data.tab_desc);
        data.tab_desc = desc_translate
          ? desc_translate[0].toUpperCase() + desc_translate.slice(1)
          : data.tab_desc;
      }

      if (data.tab_info) {
        let info_translate = translate(data.tab_info);
        data.tab_info = info_translate
          ? info_translate[0].toUpperCase() + info_translate.slice(1)
          : data.tab_info;
      }

      Ax.db.insert("wic_jdic_tabdata", {
        tab_id: 0,
        locale: NEWLANG,
        audited: 0,
        tab_name: data.tab_name,
        tab_memo: data.tab_memo,
        tab_desc: data.tab_desc,
        tab_info: data.tab_info,
        user_created: USER_CODE,
        user_updated: USER_CODE,
        date_created: DATE_CURRENT,
        date_updated: DATE_CURRENT,
      });

      Ax.db.commitWork();
      console.log("Successfull translating:", data.tab_memo);
    } catch (e) {
      console.log("Error translating:", e);
      Ax.db.rollbackWork();
    }
  });
});
